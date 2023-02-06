const {Request} = require('../objects/request')
const {GetInResponse} = require('../objects/getInResponse')
const {RequestConfig} = require('../objects/requestConfig')
const {Response} = require("../objects/response");
const Screenshot = require('../models/screenshotModel')
const Log = require('../models/logModel')
const Pdf = require('../models/pdfModel')
const redis = require('../utils/redis')
const useProxy = require('puppeteer-page-proxy');
const UserAgent = require('user-agents')
const {appConfig} = require('../configs/appConfig')
const pluginRecaptcha = require('puppeteer-extra-plugin-recaptcha')
const {EXECUTION_SUCCESS, EXECUTION_FAILED,
    ACTION_REQUIRED, NO_EXECUTION} = require("../utils/constants");
const {downloadBySelectors} = require("../utils/downloader");


function BotEngineBrowserContext(browser, logger, requestId) {

    let responsePage;

    async function createBrowserContext(browser, requestDescription) {
        const context = await browser.createIncognitoBrowserContext();
        logger.info(`Request description: ${requestDescription}`)
        logger.info(`Context created id: ${context.id}`)
        return context
    }


    async function createPageByContext(context) {
        logger.info(`Page created with context: ${context.id}`)
        return await context.newPage()
    }


    async function getContextById(contextId) {
        if (browser !== undefined) {
            const contexts = browser.browserContexts()
            const pos = contexts.map(context => context.id).indexOf(contextId)
            if (pos !== -1) {
                logger.info(`Context: ${contextId} returned`)
                return contexts[pos]
            } else {
                logger.error(`Context: ${contextId} doesn't exist`)
                return undefined
            }
        } else {
            logger.error(`Browser is undefined yet`)
        }

    }


    async function getPageByContextId(contextId) {
        try {
            const context = await getContextById(contextId)
            const pages = await context.pages()
            logger.info(`Page fetched it from context: ${contextId}`)
            return pages[0]
        } catch (error) {
            logger.error(`Error fetching page for context: ${contextId}, error ${error}`)
        }
    }


    async function runInstructions(contextId, page, argsJson) {
        let resultRunInstructions = {}
        const request = new Request(argsJson);
        const instructions = request.instructions

        await configRequestByParams(contextId, page, request.url, argsJson)

        try {
            responsePage = await page.goto(request.url, request.options)
        } catch (error) {
            resultRunInstructions = {
                "message": `${EXECUTION_FAILED.message}, Error getting url ${request.url}, Error ${error}`,
                "code": EXECUTION_FAILED.code,
                "contextId": contextId
            }
            return resultRunInstructions
        }

        let arrayInstructionsLength
        if (instructions === undefined || instructions.length === 0) {
            resultRunInstructions = {
                "message": NO_EXECUTION.message,
                "code": NO_EXECUTION.code,
                "page": page,
                "contextId": contextId
            }
            return resultRunInstructions
        } else {
            arrayInstructionsLength = instructions.length;
        }
        for (let i = 0; i < arrayInstructionsLength; i++) {
            try {
                let result = await executeInstruction(
                    instructions[i]["command"],
                    instructions[i]["params"],
                    instructions[i]["options"],
                    page)
                if (result) {
                    if(instructions[i]["command"] === 'verify') {
                        logger.warn(`Action required`)
                        logger.info(`Instruction ${(i + 1)}/${arrayInstructionsLength}-(${instructions[i]["command"]}) executed`)
                        resultRunInstructions = {
                            "message": ACTION_REQUIRED.message,
                            "code": ACTION_REQUIRED.code,
                            "page": page,
                            "contextId": contextId
                        }
                        const getResponse = new GetInResponse(argsJson)
                        await redis.set(contextId, JSON.stringify(getResponse))
                        return resultRunInstructions
                    }
                    logger.info(`Instruction ${(i + 1)}/${arrayInstructionsLength}-(${instructions[i]["command"]}) executed`)
                    if (arrayInstructionsLength - 1 === i) {
                        logger.info(`All instructions were successfully executed`)
                        resultRunInstructions = {
                            "message": EXECUTION_SUCCESS.message,
                            "code": EXECUTION_SUCCESS.code,
                            "page": page,
                            "contextId": contextId
                        }
                        return resultRunInstructions
                    }
                } else {
                    if (instructions[i]["command"] === 'verify') {
                        logger.warn(`Verify verification failed`)
                        logger.info(`Instruction ${(i + 1)}/${arrayInstructionsLength}-(${instructions[i]["command"]}) executed`)
                    }else {
                        logger.error(`Error in instruction ${(i + 1)}/${arrayInstructionsLength}-(${instructions[i]["command"]})`)
                        resultRunInstructions = {
                            "message": `${EXECUTION_FAILED.message} on ${(i + 1)}/${arrayInstructionsLength}-(${instructions[i]["command"]})`,
                            "code": EXECUTION_FAILED.code,
                            "contextId": contextId
                        }
                        return resultRunInstructions
                    }
                }
            } catch (error) {
                resultRunInstructions = {
                    "message": `${EXECUTION_FAILED.message} Error ${error}`,
                    "code": EXECUTION_FAILED.code,
                    "contextId": contextId
                }
                logger.error(error)
                return resultRunInstructions
            }
        }
    }


    // async function runInstructionsAfter2fa(contextId, page, argsJson) {
    //     let resultRunInstructions = {}
    //     const request = new Request(argsJson);
    //     const instructions = request.instructions
    //
    //     let arrayInstructionsLength
    //     if (instructions === undefined || instructions.length === 0) {
    //         resultRunInstructions = {
    //             "message": `${NO_EXECUTION.message}`,
    //             "code": EXECUTION_FAILED.code,
    //             "page": page,
    //             "contextId": contextId
    //         }
    //         return resultRunInstructions
    //     } else {
    //         arrayInstructionsLength = instructions.length;
    //     }
    //
    //     for (let i = 0; i < arrayInstructionsLength; i++) {
    //         try {
    //             let result = await executeInstruction(instructions[i]["command"], instructions[i]["params"],
    //                 instructions[i]["options"], page)
    //             if (result === true) {
    //                 logger.info(`Instruction ${(i + 1)}/${arrayInstructionsLength}-(${instructions[i]["command"]}) executed`)
    //                 if (arrayInstructionsLength - 1 === i) {
    //                     logger.info(`All instructions were successfully executed`)
    //                     resultRunInstructions = {
    //                         "message": EXECUTION_SUCCESS.message,
    //                         "code": EXECUTION_SUCCESS.code,
    //                         "contextId": contextId,
    //                         "page": page
    //                     }
    //                     return resultRunInstructions
    //                 }
    //             } else {
    //                 logger.error(`Error in instruction ${(i + 1)}/${arrayInstructionsLength}-(${instructions[i]["command"]})`)
    //                 resultRunInstructions = {
    //                     "message": `${EXECUTION_FAILED.message} on ${(i + 1)}/${arrayInstructionsLength}-(${instructions[i]["command"]})`,
    //                     "code": EXECUTION_FAILED.code,
    //                     "contextId": contextId
    //                 }
    //                 return resultRunInstructions
    //             }
    //         } catch (error) {
    //             resultRunInstructions = {
    //                 "message": `${EXECUTION_FAILED.message} Error ${error}`,
    //                 "code": `${EXECUTION_FAILED.code} Error ${error}`,
    //                 "contextId": contextId
    //             }
    //             logger.error(error)
    //             return resultRunInstructions
    //         }
    //     }
    //
    // }


    async function runInstructionsActionRequired(contextId, page, argsJson, requestDescription) {
        logger.info(`Request description: ${requestDescription}`)
        let resultRunInstructions = {}
        const request = new Request(argsJson);
        const instructions = request.instructions

        let arrayInstructionsLength
        if (instructions === undefined || instructions.length === 0) {
            resultRunInstructions = {
                "message": NO_EXECUTION.message,
                "code": NO_EXECUTION.code,
                "page": page,
                "contextId": contextId
            }
            return resultRunInstructions
        } else {
            arrayInstructionsLength = instructions.length;
        }
        for (let i = 0; i < arrayInstructionsLength; i++) {
            try {
                let result = await executeInstruction(instructions[i]["command"], instructions[i]["params"],
                    instructions[i]["options"], page)
                if (result) {
                    if(instructions[i]["command"] === 'verify') {
                        logger.warn(`Action required`)
                        logger.info(`Instruction ${(i + 1)}/${arrayInstructionsLength}-(${instructions[i]["command"]}) executed`)
                        resultRunInstructions = {
                            "message": ACTION_REQUIRED.message,
                            "code": ACTION_REQUIRED.code,
                            "page": page,
                            "contextId": contextId
                        }
                        // const getResponse = new GetInResponse(argsJson)
                        // await redis.set(contextId, JSON.stringify(getResponse))
                        return resultRunInstructions
                    }
                    logger.info(`Instruction ${(i + 1)}/${arrayInstructionsLength}-(${instructions[i]["command"]}) executed`)
                    if (arrayInstructionsLength - 1 === i) {
                        logger.info(`All instructions were successfully executed`)
                        resultRunInstructions = {
                            "message": EXECUTION_SUCCESS.message,
                            "code": EXECUTION_SUCCESS.code,
                            "page": page,
                            "contextId": contextId
                        }
                        return resultRunInstructions
                    }
                } else {
                    if (instructions[i]["command"] === 'verify') {
                        logger.warn(`Verify verification failed`)
                        logger.info(`Instruction ${(i + 1)}/${arrayInstructionsLength}-(${instructions[i]["command"]}) executed`)
                    }else {
                        logger.error(`Error in instruction ${(i + 1)}/${arrayInstructionsLength}-(${instructions[i]["command"]})`)
                        resultRunInstructions = {
                            "message": `${EXECUTION_FAILED.message} on ${(i + 1)}/${arrayInstructionsLength}-(${instructions[i]["command"]})`,
                            "code": EXECUTION_FAILED.code,
                            "page": page,
                            "contextId": contextId
                        }
                        return resultRunInstructions
                    }
                }
            } catch (error) {
                resultRunInstructions = {
                    "message": `${EXECUTION_FAILED.message} Error ${error}`,
                    "code": EXECUTION_FAILED.code,
                    "contextId": contextId
                }
                logger.error(error)
                return resultRunInstructions
            }
        }
    }


    async function getResponseByContextPage(contextId, page, argsJson) {
        const found = await redis.exists(contextId)
        let getInResponse;
        if (found === 1) {
            const responseFromRedis = await redis.get(contextId)
            logger.info(`getInResponse from 2fa founded: ${contextId}`)
            getInResponse = JSON.parse(responseFromRedis)
            // await redis.del(contextId)
        } else {
            getInResponse = new GetInResponse(argsJson)
            logger.info(`getInResponse created as new`)
        }
        if (getInResponse !== null) {
            const response = new Response();
            logger.info(`Creating response and getting extract rules for context: ${contextId}`)
            for (let key in getInResponse) {
                await getContentResponseByKey(contextId, key, getInResponse, page, response, responsePage)
            }
            return response;
        } else {
            logger.error(`GetInResponse is null in context: ${contextId}`)
            return null;
        }

    }


    async function closeBrowserContextById(contextId) {
        const context = await getContextById(contextId)
        if (context !== undefined) {
            logger.info(`BrowserContext ${contextId} closed`)
            await context.close();
        }
    }


    async function configRequestByParams(contextId, page, urlParam, params) {
        const contextToOverridePermissions = await getContextById(contextId)
        const requestConfig = new RequestConfig(params)
        const getInResponse = new GetInResponse(params)
        const logs = getInResponse.logs;
        if (Object.keys(requestConfig).length === 0) {
            logger.info(`No configs request`)
            if (logs.fullLogs !== undefined) {
                if (logs.fullLogs === true) {
                    await loggerRequestsResponses(page)
                }
            }
        } else {
            for (let key in requestConfig) {
                switch (key) {
                    case 'headers':
                        try {
                            if (requestConfig.headers !== undefined) {
                                await page.setExtraHTTPHeaders(requestConfig.headers)
                                logger.info(`Request config ${key} correctly applied`)
                            }
                        } catch (error) {
                            logger.error(`Error in requestConfig ${key}: ${error}`)
                        }
                        break
                    case 'cookies':
                        try {
                            if (requestConfig.cookies !== undefined) {
                                const cookies = JSON.parse(requestConfig.cookies)
                                await page.setCookie(...cookies)
                                logger.info(`Request config ${key} correctly applied`)
                            }
                        } catch (error) {
                            logger.error(`Error in requestConfig ${key}: ${error}`)
                        }
                        break
                    case 'blockResources':
                        try {
                            if (requestConfig.blockResources !== undefined) {
                                await blockResources(page, requestConfig.blockResources, logs.fullLogs)
                                logger.info(`Request config ${key} correctly applied`)
                            } else {
                                if (logs.fullLogs !== undefined) {
                                    if (logs.fullLogs === true) {
                                        await loggerRequestsResponses(page)
                                    }
                                }
                            }
                        } catch (error) {
                            logger.error(`Error in requestConfig ${key}: ${error}`)
                        }
                        break
                    case 'captcha':
                        try {
                            if (requestConfig.captcha !== undefined) {
                                const recaptcha = pluginRecaptcha(
                                    {
                                        provider: {
                                            id: requestConfig.captcha.type,
                                            token: process.env.ANTICAPTCHA_API_KEY
                                        },
                                        visualFeedback: true
                                    })
                                await recaptcha.solveRecaptchas(page)
                                logger.info(`Request config ${key} correctly applied`)
                            }
                        } catch (error) {
                            logger.error(`Error in requestConfig ${key}: ${error}`)
                        }
                        break
                    case 'geolocation':
                        try {
                            if (requestConfig.geolocation !== undefined) {
                                await contextToOverridePermissions.overridePermissions(urlParam, ['geolocation'])
                                await page.setGeolocation({
                                    latitude: requestConfig.geolocation.latitude,
                                    longitude: requestConfig.geolocation.longitude
                                });
                                logger.info(`Request config ${key} correctly applied`)
                            }
                        } catch (error) {
                            logger.error(`Error in requestConfig ${key}: ${error}`)
                        }
                        break
                    case 'userAgent':
                        try {
                            if (requestConfig.userAgent !== undefined) {
                                await page.setUserAgent(requestConfig.userAgent)
                                logger.info(`Request config ${key} correctly applied`)
                            } else {
                                const userAgent = new UserAgent().toString()
                                await page.setUserAgent(userAgent)
                                logger.info(`Setting randomUserAgent correctly: ${userAgent}`)
                            }
                        } catch (error) {
                            logger.error(`Error in requestConfig ${key}: ${error}`)
                        }
                        break
                    case 'viewPort':
                        try {
                            if (requestConfig.viewPort !== undefined) {
                                await page.setViewport({
                                    width: requestConfig.viewPort.width,
                                    height: requestConfig.viewPort.height,
                                    deviceScaleFactor: 1,
                                });
                                logger.info(`Request config ${key} correctly applied`)
                            }
                        } catch (error) {
                            logger.error(`Error in requestConfig ${key}: ${error}`)
                        }
                        break
                    case 'customProxy':
                        try {
                            if (requestConfig.customProxy !== undefined) {
                                await useProxy(page, requestConfig.customProxy);
                                logger.info(`Request config ${key} correctly applied`)
                            }
                        } catch (error) {
                            logger.error(`Error in requestConfig ${key}: ${error}`)
                        }
                        break
                }
            }
        }
    }


    async function blockResources(page, resourceTypes, fullLogs) {
        if (resourceTypes.length > 0) {
            logger.info(`Resources to block`)
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                if (fullLogs !== undefined) {
                    if (fullLogs === true) {
                        fullLogsRequests(request)
                    }
                }
                if (resourceTypes.indexOf(request.resourceType()) !== -1) {
                    request.abort();
                } else {
                    request.continue();
                }
            });

            page.on('response', (response) => {
                if (fullLogs !== undefined) {
                    if (fullLogs === true) {
                        fullLogsResponses(response)
                    }
                }
            });
        } else {
            await loggerRequestsResponses(page)
        }
    }


    async function loggerRequestsResponses(page) {
        await page.setRequestInterception(true);
        page.on('request', request => {
            fullLogsRequests(request)
        });
        page.on('response', response => {
            fullLogsResponses(response)
        });
    }


    async function fullLogsRequests(request) {
        const result = [];
        try {
            const request_url = request.url();
            const request_headers = request.headers();
            const request_cookies = request.cookies;
            const request_post_data = request.postData();

            result.push({
                request_url,
                request_headers,
                request_cookies,
                request_post_data
            });
            logger.debug(`Request: ${JSON.stringify(result)}`)
        } catch (error) {
            logger.error(`Request error: ${JSON.stringify(error)}`)
        }
    }


    async function fullLogsResponses(response) {
        const result = [];
        try {
            const response_headers = response.headers;
            const response_cookies = response.cookies;
            const response_size = response_headers['content-length'];
            const response_body = response.body;

            result.push({
                response_headers,
                response_cookies,
                response_size,
                response_body
            });
            logger.debug(`Response: ${JSON.stringify(result)}`)
        } catch (error) {
            logger.error(`Response error: ${JSON.stringify(error)}`)
        }
    }


    async function getContentResponseByKey(contextId, key, getInResponse, page, response, responsePageParam) {
        const {host, port} = appConfig
        if (getInResponse === undefined) {
            logger.warn(`No keys to return response`)
        } else {
            switch (key) {
                case "cookies":
                    try {
                        if (getInResponse.cookies !== undefined) {
                            const cookies = await page.cookies()
                            getInResponse.cookies === true ? response.cookies = JSON.stringify(cookies, null, 2) : response.cookies = {}
                            logger.info(`${key} get it correctly`)
                        }
                    } catch (error) {
                        logger.error(`Error getting ${key}-->${error}`)
                    }
                    break
                case "headers":
                    try {
                        if (getInResponse.headers !== undefined) {
                            getInResponse.headers === true ? response.headers = responsePageParam.headers() : response.headers = {}
                            logger.info(`${key} get it correctly`)
                        }
                    } catch (error) {
                        logger.error(`Error getting ${key}-->${error}`)
                    }
                    break
                case "screenshot":
                    if (getInResponse.screenshot !== undefined) {
                        let screenshot = new Screenshot({
                            idContext: contextId,
                            idRequest: requestId,
                            urlPage: page.url()
                        })
                        try {
                            const {host, port} = appConfig
                            const screenshotObject = getInResponse.screenshot
                            const fullPageFlag = screenshotObject["full_page"]
                            const fileName = `${requestId}_${Date.now()}.jpg`
                            const imagePath = `${process.env.IMAGES_PATH}${fileName}`
                            const imageUrl = `${host}:${port}/api/files/public/screenshots/${fileName}`
                            const imageUrlResponse = `${host}:${port}/api/files/image-info?image_request_id=${fileName.split('_')[0]}`
                            if (screenshotObject["active"]) {
                                await page.screenshot({
                                    path: imagePath,
                                    quality: 50,
                                    type: 'jpeg',
                                    fullPage: fullPageFlag
                                })
                                screenshot.imageUrl = imageUrl;
                                response.screenshot = imageUrlResponse
                                logger.info(`${key} get it correctly`)
                                logger.info(`Image pushed to database ${fileName}.jpg`)
                            }
                        } catch (error) {
                            logger.error(`Error getting ${key}-->${error}`)
                            screenshot.error = error.toString();
                        }
                        await screenshot.save()
                    }
                    break
                case "logs":
                    let log = new Log({
                        idContext: contextId,
                        idRequest: requestId
                    })
                    try {
                        if (getInResponse.logs !== undefined) {
                            const fileName = await redis.get(`logName_${requestId}`)
                            const logUrl = `${host}:${port}/api/files/public/logs/${fileName}.log`
                            const logUrlResponse = `${host}:${port}/api/files/log-info?log_request_id=${fileName.split('_')[0]}`
                            log.logUrl = logUrl
                            getInResponse.logs.active === true ? response.logs = logUrlResponse : response.logs = {}
                            logger.info(`${key} get it correctly`)
                            logger.info(`Log pushed to database ${fileName}.log`)
                        }
                        await log.save()
                    } catch (error) {
                        logger.error(`Error getting ${key}-->${error}`)
                    }
                    break
                case "htmlToPdf":
                    try {
                        if (getInResponse.htmlToPdf !== undefined) {
                            const buffer = await page.pdf({format: "A4"});
                            const pdfBase64 = buffer.toString('base64');
                            getInResponse.htmlToPdf === true ? response.htmlToPdf = pdfBase64 : response.htmlToPdf = ""
                            logger.info(`${key} get it correctly`)
                        }
                    } catch (error) {
                        logger.error(`Error getting ${key}-->${error}`)
                    }
                    break
                case "sourcePage":
                    try {
                        if (getInResponse.sourcePage !== undefined) {
                            getInResponse.sourcePage === true ? response.sourcePage = await page.content() : response.sourcePage = {}
                            logger.info(`${key} get it correctly`)
                        }
                    } catch (error) {
                        logger.error(`Error getting ${key}-->${error}`)
                    }
                    break
                case "downloadFiles":
                    //In construction
                    let pdf = new Pdf({
                        idContext: contextId,
                        idRequest: requestId
                    })
                    try {
                        if (getInResponse.downloadFiles !== undefined) {
                            const selectors = getInResponse.downloadFiles.selectors
                            if (selectors.length > 0) {
                                let filesUrls = []
                                let filesDir = `${requestId}_${Date.now()}`
                                await downloadBySelectors(selectors, filesDir, page)
                                let pdfUrl = `${host}:${port}/api/files/public/pdfs/${filesDir}.pdf`
                                let pdfUrlResponse = `${host}:${port}/api/files/pdf-info?pdf_request_id=${filesDir.split('_')[0]}`
                                pdf.pdfUrl = pdfUrl
                                filesUrls.push(pdfUrlResponse)
                                response.downloadFiles = filesUrls
                            } else {
                                response.downloadFiles = ""
                            }
                            logger.info(`${key} get it correctly`)
                        }
                        await pdf.save()
                    } catch (error) {
                        logger.error(`Error getting ${key}-->${error}`)
                    }
                    break
                case "extractRules":
                    //In construction
                    try {
                        if (getInResponse.extractRules !== undefined) {
                            const arrayExtractRulesLength = getInResponse.extractRules.length;
                            let extract_response = {}
                            if (arrayExtractRulesLength > 0) {
                                for (let key in Object.keys(getInResponse)) {
                                    try {
                                        logger.info(`extract rule ${(key + 1)}/${arrayExtractRulesLength}`)
                                        extract_response[key] = await page.$x(getInResponse["extract_rules"][key])
                                    } catch (error) {
                                        extract_response[key] = error.toString()
                                        logger.error(`Error getting rule ${key}-->${error}`)
                                        break
                                    }
                                }
                                response.extractRules = extract_response
                                logger.info(`${key} get it correctly`)
                            } else {
                                response.extractRules = {}
                            }
                        }
                    } catch (error) {
                        logger.error(`Error getting ${key}-->${error}`)
                    }
                    break
            }
        }


    }


    async function executeInstruction(command, params, options, page) {
        switch (command) {
            case "goto":
                try {
                    await page.goto(params[0], options)
                    return true
                } catch (error) {
                    logger.error(`Error goto ${error}`)
                    return false
                }
            case "click":
                try {
                    await page.click(params[0], options)
                    return true
                } catch (error) {
                    logger.error(`Error click ${error}`)
                    return false
                }
            case "wait_for_timeout":
                try {
                    await page.waitForTimeout(params[0])
                    return true
                } catch (error) {
                    logger.error(`Error waitForTimeout ${error}`)
                    return false
                }
            case "wait_for_selector":
                try {
                    await page.waitForSelector(params[0], options)
                    return true
                } catch (error) {
                    logger.error(`Error waitForSelector ${error}`)
                    return false
                }
            case "wait_for_selector_and_click":
                try {
                    await page.waitForSelector(params[0], options)
                    await page.click(params[0], options)
                    return true
                } catch (error) {
                    logger.error(`Error waitForSelectorAndClick ${error}`)
                    return false
                }
            case "wait_for_xpath":
                try {
                    await page.waitForXPath(params[0], options)
                    return true
                } catch (error) {
                    logger.error(`Error waitForXPath ${error}`)
                    return false
                }
            case "wait_for_navigation":
                try {
                    await page.waitForNavigation(options)
                    return true
                } catch (error) {
                    logger.error(`Error waitForNavigation ${error}`)
                    return false
                }
            case "wait_for_response":
                try {
                    await page.waitForResponse(params[0], options)
                    return true
                } catch (error) {
                    logger.error(`Error waitForResponse ${error}`)
                    return false
                }
            case "evaluate":
                try {
                    await page.evaluate(params[0], options)
                    return true
                } catch (error) {
                    logger.error(`Error evaluate ${error}`)
                    return false
                }
            case "verify":
                try {
                    const stringProve = params[0];
                    logger.info(`StringProve: ${stringProve}`)
                    let htmlPage = await page.content()
                    return htmlPage.includes(stringProve)
                } catch (error) {
                    logger.error(`Error verify ${error}`)
                    return false
                }
            case "wait_for_function":
                try {
                    await page.waitForFunction(params[0], options)
                    return true
                } catch (error) {
                    logger.error(`Error waitForFunction ${error}`)
                    return false
                }
            case "xpath":
                try {
                    await page.$x(params[0])
                    return true
                } catch (error) {
                    logger.error(`Error xpath ${error}`)
                    return false
                }
            case "type":
                try {
                    await page.type(params[0], params[1], options)
                    return true
                } catch (error) {
                    logger.error(`Error type ${error}`)
                    return false
                }
            case "keyboard_pres":
                try {
                    await page.keyboard.press(params[0], options)
                    return true
                } catch (error) {
                    logger.error(`Error type ${error}`)
                    return false
                }
        }
    }



    return Object.freeze({
        getContextById,
        runInstructions,
        getPageByContextId,
        createPageByContext,
        createBrowserContext,
        // runInstructionsAfter2fa,
        runInstructionsActionRequired,
        closeBrowserContextById,
        getResponseByContextPage
    })

}


module.exports = {BotEngineBrowserContext};