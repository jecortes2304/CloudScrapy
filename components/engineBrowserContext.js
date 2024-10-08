const {Request} = require('../objects/request')
const {GetInResponse} = require('../objects/getInResponse')
const {RequestConfig} = require('../objects/requestConfig')
const {Response} = require("../objects/response");
const Screenshot = require('../models/screenshotModel')
const Log = require('../models/logModel')
const Pdf = require('../models/pdfModel')
const User = require('../models/userModel')
const redis = require('../utils/redis')
const UserAgent = require('user-agents')
const config = require('config')
const serverUrl = config.get('server.server_url')
const imagesPath = config.get('paths.images_path')
const pdfsPath = config.get('paths.pdf_path')
const cryptoUtils = require('../utils/cryptoUtils')
const pluginRecaptcha = require('puppeteer-extra-plugin-recaptcha')
const useProxy = require('puppeteer-page-proxy');
const {ANTICAPTCHA_API_KEY} = config.get('tokens')
const {CLOUD_SCRAPY_ERRORS, ROUTES_FILES_V1} = require("../utils/constants");

// const {downloadBySelectors} = require("../utils/downloader");


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
            return undefined
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
                "message": `${CLOUD_SCRAPY_ERRORS.EXECUTION_FAILED.message}, Error getting url ${request.url}, Error ${error}`,
                "code": CLOUD_SCRAPY_ERRORS.EXECUTION_FAILED.code,
                "contextId": contextId
            }
            return resultRunInstructions
        }

        let arrayInstructionsLength
        if (instructions === undefined || instructions.length === 0) {
            resultRunInstructions = {
                "message": CLOUD_SCRAPY_ERRORS.NO_EXECUTION.message,
                "code": CLOUD_SCRAPY_ERRORS.NO_EXECUTION.code,
                "contextId": contextId
            }
            return resultRunInstructions
        } else {
            arrayInstructionsLength = instructions.length;
        }
        for (let i = 0; i < arrayInstructionsLength; i++) {
            try {
                let result = await executeInstruction(
                    instructions[i].command,
                    instructions[i].params,
                    instructions[i].options,
                    page)
                if (result) {
                    if (instructions[i].command === 'verify') {
                        logger.warn(`Action required`)
                        logger.info(`Instruction ${(i + 1)}/${arrayInstructionsLength}-(${instructions[i].command}) executed`)
                        resultRunInstructions = {
                            "message": CLOUD_SCRAPY_ERRORS.ACTION_REQUIRED.message,
                            "code": CLOUD_SCRAPY_ERRORS.ACTION_REQUIRED.code,
                            "contextId": contextId
                        }
                        const getResponse = new GetInResponse(argsJson)
                        await redis.set(`getInResponse_${requestId}`, JSON.stringify(getResponse))
                        return resultRunInstructions
                    }
                    logger.info(`Instruction ${(i + 1)}/${arrayInstructionsLength}-(${instructions[i].command}) executed`)
                    if (arrayInstructionsLength - 1 === i) {
                        logger.info(`All instructions were successfully executed`)
                        resultRunInstructions = {
                            "message": CLOUD_SCRAPY_ERRORS.EXECUTION_SUCCESS.message,
                            "code": CLOUD_SCRAPY_ERRORS.EXECUTION_SUCCESS.code,
                            "contextId": contextId
                        }
                        return resultRunInstructions
                    }
                } else {
                    if (instructions[i].command === 'verify') {
                        logger.info(`Instruction ${(i + 1)}/${arrayInstructionsLength}-(${instructions[i].command}) executed`)
                        if (arrayInstructionsLength - 1 === i) {
                            logger.warn(`Source page verification failed and returned result`)
                            logger.info(`All instructions were successfully executed`)
                            resultRunInstructions = {
                                "message": CLOUD_SCRAPY_ERRORS.EXECUTION_SUCCESS.message,
                                "code": CLOUD_SCRAPY_ERRORS.EXECUTION_SUCCESS.code,
                                "contextId": contextId
                            }
                            return resultRunInstructions
                        } else {
                            logger.warn(`Source page verification failed and continue`)
                        }
                    } else {
                        logger.error(`Error in instruction ${(i + 1)}/${arrayInstructionsLength}-(${instructions[i].command})`)
                        resultRunInstructions = {
                            "message": `${CLOUD_SCRAPY_ERRORS.EXECUTION_FAILED.message} on ${(i + 1)}/${arrayInstructionsLength}-(${instructions[i].command})`,
                            "code": CLOUD_SCRAPY_ERRORS.EXECUTION_FAILED.code,
                            "contextId": contextId
                        }
                        return resultRunInstructions
                    }
                }
            } catch (error) {
                resultRunInstructions = {
                    "message": `${CLOUD_SCRAPY_ERRORS.EXECUTION_FAILED.message} Error ${error}`,
                    "code": CLOUD_SCRAPY_ERRORS.EXECUTION_FAILED.code,
                    "contextId": contextId
                }
                logger.error(error)
                return resultRunInstructions
            }
        }
    }


    async function runInstructionsActionRequired(contextId, page, argsJson, requestDescription) {
        logger.info(`Request description: ${requestDescription}`)
        let resultRunInstructions = {}
        const request = new Request(argsJson);
        const ActionRequiredInstructions = request.instructions

        let arrayInstructionsLength
        if (ActionRequiredInstructions === undefined || ActionRequiredInstructions.length === 0) {
            resultRunInstructions = {
                "message": CLOUD_SCRAPY_ERRORS.NO_EXECUTION.message,
                "code": CLOUD_SCRAPY_ERRORS.NO_EXECUTION.code,
                "contextId": contextId
            }
            return resultRunInstructions
        } else {
            arrayInstructionsLength = ActionRequiredInstructions.length;
        }
        for (let i = 0; i < arrayInstructionsLength; i++) {
            try {
                let result = await executeInstruction(ActionRequiredInstructions[i].command, ActionRequiredInstructions[i].params,
                    ActionRequiredInstructions[i].options, page)
                if (result) {
                    if (ActionRequiredInstructions[i].command === 'verify') {
                        logger.warn(`Action required`)
                        logger.info(`Instruction ${(i + 1)}/${arrayInstructionsLength}-(${ActionRequiredInstructions[i].command}) executed`)
                        resultRunInstructions = {
                            "message": CLOUD_SCRAPY_ERRORS.ACTION_REQUIRED.message,
                            "code": CLOUD_SCRAPY_ERRORS.ACTION_REQUIRED.code,
                            "contextId": contextId
                        }
                        return resultRunInstructions
                    }
                    logger.info(`Instruction ${(i + 1)}/${arrayInstructionsLength}-(${ActionRequiredInstructions[i].command}) executed`)
                    if (arrayInstructionsLength - 1 === i) {
                        logger.info(`All instructions were successfully executed`)
                        resultRunInstructions = {
                            "message": CLOUD_SCRAPY_ERRORS.EXECUTION_SUCCESS.message,
                            "code": CLOUD_SCRAPY_ERRORS.EXECUTION_SUCCESS.code,
                            "contextId": contextId
                        }
                        return resultRunInstructions
                    }
                } else {
                    if (ActionRequiredInstructions[i].command === 'verify') {
                        logger.info(`Instruction ${(i + 1)}/${arrayInstructionsLength}-(${ActionRequiredInstructions[i].command}) executed`)
                        if (arrayInstructionsLength - 1 === i) {
                            logger.warn(`Source page verification failed and returned result`)
                            logger.info(`All instructions were successfully executed`)
                            resultRunInstructions = {
                                "message": CLOUD_SCRAPY_ERRORS.EXECUTION_SUCCESS.message,
                                "code": CLOUD_SCRAPY_ERRORS.EXECUTION_SUCCESS.code,
                                "contextId": contextId
                            }
                            return resultRunInstructions
                        } else {
                            logger.warn(`Source page verification failed and continue`)
                        }
                    } else {
                        logger.error(`Error in instruction ${(i + 1)}/${arrayInstructionsLength}-(${ActionRequiredInstructions[i].command})`)
                        resultRunInstructions = {
                            "message": `${CLOUD_SCRAPY_ERRORS.EXECUTION_FAILED.message} on ${(i + 1)}/${arrayInstructionsLength}-(${ActionRequiredInstructions[i].command})`,
                            "code": CLOUD_SCRAPY_ERRORS.EXECUTION_FAILED.code,
                            "contextId": contextId
                        }
                        return resultRunInstructions
                    }
                }
            } catch (error) {
                resultRunInstructions = {
                    "message": `${CLOUD_SCRAPY_ERRORS.EXECUTION_FAILED.message} Error ${error}`,
                    "code": CLOUD_SCRAPY_ERRORS.EXECUTION_FAILED.code,
                    "contextId": contextId
                }
                logger.error(error)
                return resultRunInstructions
            }
        }
    }


    async function getResponseByContextPage(contextId, argsJson) {
        const found = await redis.exists(`getInResponse_${requestId}`)
        const page = await getPageByContextId(contextId)
        let getInResponse;
        if (found === 1) {
            const responseFromRedis = await redis.get(`getInResponse_${requestId}`)
            logger.info(`getInResponse from 2fa founded: ${contextId}`)
            getInResponse = JSON.parse(responseFromRedis)
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
            const idTimeoutFlag = await redis.get(`idTimeout_${contextId}`)
            clearTimeout(idTimeoutFlag)
            await redis.del(`idTimeout_${contextId}`)
            await redis.del(`logName_${requestId}`)
            await redis.del(`getInResponse_${requestId}`)
            await redis.del(`browserContext_${requestId}`)
            await redis.del(`userId_${requestId}`)
            logger.info(`BrowserContext ${contextId} closed`)
            await context.close();
            return true
        }else {
            return false
        }
    }


    async function configRequestByParams(contextId, page, urlParam, params) {
        const contextToOverridePermissions = await getContextById(contextId)
        const requestConfig = new RequestConfig(params)
        const getInResponse = new GetInResponse(params)
        const logs = getInResponse.logs;
        if (Object.keys(requestConfig).length === 0) {
            logger.info(`No configs request`)
            if (logs.full_logs !== undefined && logs.full_logs === true) {
                await loggerRequestsResponses(page)
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
                                if (logs !== undefined && logs.full_logs !== undefined && logs.full_logs === true) {
                                    await blockResources(page, requestConfig.blockResources, logs.full_logs)
                                } else {
                                    await blockResources(page, requestConfig.blockResources, undefined)
                                }
                                logger.info(`Request config ${key} correctly applied`)
                            } else {
                                if (logs.full_logs !== undefined && logs.full_logs === true) {
                                    await loggerRequestsResponses(page)
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
                                            token: ANTICAPTCHA_API_KEY
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
                if (fullLogs !== undefined && fullLogs === true) {
                    fullLogsRequests(request)
                }
                if (resourceTypes.indexOf(request.resourceType()) !== -1) {
                    request.abort();
                } else {
                    request.continue();
                }
            });

            page.on('response', (response) => {
                if (fullLogs !== undefined && fullLogs === true) {
                    fullLogsResponses(response)
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
        const userId = await redis.get(`userId_${requestId}`)

        if (getInResponse === undefined) {
            logger.warn(`No keys to return response`)
        } else {
            switch (key) {
                case "cookies":
                    try {
                        if (getInResponse.cookies !== undefined && getInResponse.cookies === true) {
                            const cookies = await page.cookies()
                            response.cookies = JSON.stringify(cookies, null, 2)
                            logger.info(`${key} get it correctly`)
                        }
                    } catch (error) {
                        logger.error(`Error getting ${key}-->${error}`)
                    }
                    break
                case "headers":
                    try {
                        if (getInResponse.headers !== undefined && getInResponse.headers === true) {
                            response.headers = responsePageParam.headers()
                            logger.info(`${key} get it correctly`)
                        }
                    } catch (error) {
                        logger.error(`Error getting ${key}-->${error}`)
                    }
                    break
                case "screenshot":
                    if (getInResponse.screenshot !== undefined && getInResponse.screenshot.active === true) {
                        let screenshot = new Screenshot({
                            idContext: contextId,
                            idRequest: requestId,
                            urlPage: page.url()
                        })
                        try {
                            const fullPageFlag = getInResponse.screenshot.full_page
                            const fileName = `${requestId}_${Date.now()}.jpg`
                            const imagePath = `${imagesPath}${fileName}`
                            const imageUrl = `${serverUrl}${ROUTES_FILES_V1.SCREENSHOT}/${fileName}`
                            const imageUrlResponse = `${serverUrl}${ROUTES_FILES_V1.SCREENSHOT_INFO}/${fileName.split('_')[0]}`
                            await page.screenshot({path: imagePath, quality: 50, type: 'jpeg', fullPage: fullPageFlag})
                            screenshot.imageUrl = imageUrl;
                            screenshot.userId = userId;
                            response.screenshot = {
                                    imgInfoUrl: imageUrlResponse,
                                    imgDownloadUrl: imageUrl
                                }
                            logger.info(`${key} get it correctly`)
                            logger.info(`Image pushed to database ${fileName}`)
                        } catch (error) {
                            logger.error(`Error getting ${key}-->${error}`)
                            screenshot.error = error.toString();
                        }
                        await screenshot.save()
                    }
                    break
                case "logs":
                    if (getInResponse.logs !== undefined && getInResponse.logs.active === true) {
                        let log = new Log({
                            idContext: contextId,
                            idRequest: requestId
                        })
                        try {
                            const fileName = await redis.get(`logName_${requestId}`)
                            const logUrl = `${serverUrl}${ROUTES_FILES_V1.LOG}/${fileName}.log`
                            const logUrlResponse = `${serverUrl}${ROUTES_FILES_V1.LOG_INFO}/${fileName.split('_')[0]}`
                            log.logUrl = logUrl
                            log.userId = userId
                            response.logs = {
                                logInfoUrl: logUrlResponse,
                                logDownloadUrl: logUrl
                            }
                            logger.info(`${key} get it correctly`)
                            logger.info(`Log pushed to database ${fileName}.log`)
                            await log.save()
                        } catch (error) {
                            logger.error(`Error getting ${key}-->${error}`)
                        }
                    }
                    break
                case "htmlToPdf":
                    if (getInResponse.htmlToPdf !== undefined && getInResponse.htmlToPdf === true) {
                        let pdf = new Pdf({
                            idContext: contextId,
                            idRequest: requestId,
                            urlPage: page.url()
                        })
                        try {
                            const fileName = `${requestId}_${Date.now()}.pdf`
                            const pdfPath = `${pdfsPath}${fileName}`
                            const pdfUrl = `${serverUrl}${ROUTES_FILES_V1.PDF}/${fileName}`
                            const pdfUrlResponse = `${serverUrl}${ROUTES_FILES_V1.PDF_INFO}/${fileName.split('_')[0]}`
                            await page.pdf({path: pdfPath, format: 'A4', printBackground: true})
                            pdf.pdfUrl = pdfUrl;
                            pdf.userId = userId
                            response.htmlToPdf = {
                                pdfInfoUrl: pdfUrlResponse,
                                pdfDownloadUrl: pdfUrl
                            }
                            logger.info(`${key} get it correctly`)
                            logger.info(`Pdf pushed to database ${fileName}`)
                        } catch (error) {
                            logger.error(`Error getting ${key}-->${error}`)
                            pdf.error = error.toString();
                        }
                        await pdf.save();
                    }
                    break
                case "sourcePage":
                    try {
                        if (getInResponse.sourcePage !== undefined && getInResponse.sourcePage === true) {
                            response.sourcePage = await page.content()
                            logger.info(`${key} get it correctly`)
                        }
                    } catch (error) {
                        logger.error(`Error getting ${key}-->${error}`)
                    }
                    break
                case "extractRules":
                    if (getInResponse.extractRules !== undefined) {
                        try {
                            const arrayExtractRulesLength = Object.keys(getInResponse.extractRules).length;
                            let extract_response = {}
                            if (arrayExtractRulesLength > 0) {
                                for (let i = 0; i < arrayExtractRulesLength; i++) {
                                    let rule = getInResponse.extractRules[i]
                                    try {
                                        logger.info(`extract rule ${(i + 1)}/${arrayExtractRulesLength} - ${rule.name}`)
                                        extract_response[rule.name] = await getByElementsBySelector(
                                            page,
                                            rule)
                                    } catch (error) {
                                        extract_response[rule.name] = error.toString()
                                        logger.error(`Error getting rule ${rule.name}-->${error}`)
                                    }
                                }
                                response.extractRules = extract_response
                                logger.info(`${key} get it correctly`)
                            } else {
                                response.extractRules = {}
                            }
                        } catch (error) {
                            logger.error(`Error getting ${key}-->${error}`)
                        }
                    }
                    break
            }
        }
    }


    async function getByElementsBySelector(page, rule){
         return await page.evaluate(rule => {
            let arrayRaw =  document.querySelectorAll(rule.selector);
            if (arrayRaw.length > 1){
                return Array.from(arrayRaw).map(value => value[rule.attribute])
            }else {
                return arrayRaw[0][rule.attribute]
            }
        }, rule);
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
            case "click_and_wait":
                try {
                    await Promise.all([
                        page.waitForNavigation({waitUntil: "networkidle0"}),
                        page.click(params[0], options)
                    ]);
                    return true
                } catch (error) {
                    logger.error(`Error clickAndWait ${error}`)
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
            case "wait_selector_click_wait_nav":
                try {
                    await Promise.all([
                        page.waitForSelector(params[0], options),
                        page.waitForNavigation({waitUntil: "networkidle0"}),
                        page.click(params[0], options)
                    ]);
                    return true
                } catch (error) {
                    logger.error(`Error waitForSelectorClickAndWaitNav ${error}`)
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
            case "sec_type":
                try {
                    const privateKey = await getPrivateKeyByUserId()
                    const plainText = cryptoUtils.encryptDecrypt().decrypt(params[1], privateKey)
                    await page.type(params[0], plainText, options)
                    return true
                } catch (error) {
                    logger.error(`Error sec_type ${error}`)
                    return false
                }
            case "keyboard_press":
                try {
                    await page.keyboard.press(params[0], options)
                    return true
                } catch (error) {
                    logger.error(`Error keyboard_press ${error}`)
                    return false
                }
            case "keyboard_down":
                try {
                    await page.keyboard.down(params[0], options)
                    return true
                } catch (error) {
                    logger.error(`Error keyboard_down ${error}`)
                    return false
                }
            case "keyboard_up":
                try {
                    await page.keyboard.up(params[0], options)
                    return true
                } catch (error) {
                    logger.error(`Error keyboard_up ${error}`)
                    return false
                }
        }
    }


    async function getPrivateKeyByUserId() {
        const userId = await redis.get(`userId_${requestId}`)
        const user = await User.findOne({_id: userId});
        return user.keysPair.privateKey;
    }


    return Object.freeze({
        getContextById,
        runInstructions,
        getPageByContextId,
        createPageByContext,
        createBrowserContext,
        runInstructionsActionRequired,
        closeBrowserContextById,
        getContentResponseByKey,
        getResponseByContextPage
    })

}


module.exports = {BotEngineBrowserContext};