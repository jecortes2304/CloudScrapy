const {Request} = require('../objects/request')
const {GetInResponse} = require('../objects/getInResponse')
const {RequestConfig} = require('../objects/requestConfig')
const {Response} = require("../objects/response");
const Screenshot = require('../models/screenshot_model')
const {executablePath} = require("puppeteer");
const puppeteer = require("puppeteer-extra");
const logger = require('../utils/logger')("")
const redis = require('../utils/redis')
const config = require('../configs/config.json')
const pluginAdBlocker = require('puppeteer-extra-plugin-adblocker')()
const pluginStealth = require('puppeteer-extra-plugin-stealth')()
const pluginBlockResources = require('puppeteer-extra-plugin-block-resources')()
puppeteer.use(pluginAdBlocker)
puppeteer.use(pluginBlockResources)
puppeteer.use(pluginStealth)


function botEngine() {

    let browser;
    let responsePage;

    async function initBrowser() {
        config.config_1["executablePath"] = executablePath()
        browser = await puppeteer.launch(config.config_1);
        browser.on('disconnected', () => {
            logger.error(`Browser disconnected id: ${browser.target()._targetId}`)
            if (browser.process() != null) {
                browser.process().kill('SIGINT')
            }
            logger.info(`Relaunching browser...`)
            initBrowser();
        });
        logger.info(`Browser created id: ${browser.target()._targetId}`)
        return browser
    }


    async function createBrowserContext(browser) {
        const context = await browser.createIncognitoBrowserContext();
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

        await configRequestByParams(page, argsJson)

        responsePage = await page.goto(request.url, request.options)

        const arrayInstructionsLength = instructions.length;
        if (arrayInstructionsLength === 0){
            resultRunInstructions = {
                "message": "No instructions",
                "page": page,
                "contextId": contextId
            }
            return resultRunInstructions
        }
        for (let i = 0; i < arrayInstructionsLength; i++) {
            try {
                let result = await executeInstruction(
                    instructions[i]["command"],
                    instructions[i]["params"],
                    instructions[i]["options"],
                    page)
                if (result) {
                    if (instructions[i]["command"] === 'evaluate_sca') {
                        logger.warn(`Action required`)
                        logger.info(`Instruction ${(i + 1)}/${arrayInstructionsLength}-(${instructions[i]["command"]}) executed`)
                        resultRunInstructions = {
                            "message": "Action required",
                            "contextId": contextId
                        }
                        const getResponse = new GetInResponse(argsJson)
                        await redis.set(contextId, JSON.stringify(getResponse))
                        return resultRunInstructions
                    }
                    logger.info(`Instruction ${(i + 1)}/${arrayInstructionsLength}-(${instructions[i]["command"]}) executed`)
                    if (arrayInstructionsLength-1 === i) {
                        logger.info(`All instructions were successfully executed`)
                        resultRunInstructions = {
                            "message": "Instructions successfully executed",
                            "page": page,
                            "contextId": contextId
                        }
                        pluginBlockResources.blockedTypes.clear()
                        return resultRunInstructions
                    }
                } else {
                    if (instructions[i]["command"] === 'evaluate_sca') {
                        logger.warn(`Sca verification failed`)
                        logger.info(`Instruction ${(i + 1)}/${arrayInstructionsLength}-(${instructions[i]["command"]}) executed`)
                        resultRunInstructions = {
                            "message": "Sca verification failed",
                            "contextId": contextId
                        }
                        pluginBlockResources.blockedTypes.clear()
                        return resultRunInstructions
                    }
                    logger.error(`Error in instruction ${(i + 1)}/${arrayInstructionsLength}-(${instructions[i]["command"]})`)
                    resultRunInstructions = {
                        "message": `Instructions failed on ${(i + 1)}/${arrayInstructionsLength}-(${instructions[i]["command"]})`,
                        "contextId": contextId
                    }
                    pluginBlockResources.blockedTypes.clear()
                    return resultRunInstructions
                }
            } catch (error) {
                resultRunInstructions = {
                    "message": `Error ${error}`,
                    "contextId": contextId
                }
                logger.error(error)
                pluginBlockResources.blockedTypes.clear()
                return resultRunInstructions
            }
        }
    }


    async function runInstructionsAfter2fa(contextId, page, argsJson) {
        let resultRunInstructions = {}
        const request = new Request(argsJson);
        const instructions = request.instructions

        const arrayInstructionsLength = instructions.length;
        for (let i = 0; i < arrayInstructionsLength; i++) {
            try {
                let result = await executeInstruction(instructions[i]["command"],instructions[i]["params"],
                    instructions[i]["options"],page)
                if (result) {
                    logger.info(`Instruction ${(i + 1)}/${arrayInstructionsLength}-(${instructions[i]["command"]}) executed`)
                    if (arrayInstructionsLength-1 === i) {
                        logger.info(`All instructions were successfully executed`)
                        resultRunInstructions = {
                            "message": "Instructions successfully executed",
                            "contextId": contextId,
                            "page": page
                        }
                        pluginBlockResources.blockedTypes.clear()
                        return resultRunInstructions
                    }
                } else {
                    logger.error(`Error in instruction ${(i + 1)}/${arrayInstructionsLength}-(${instructions[i]["command"]})`)
                    resultRunInstructions = {
                        "message": `Instructions failed on ${(i + 1)}/${arrayInstructionsLength}-(${instructions[i]["command"]})`,
                        "contextId": contextId
                    }
                    pluginBlockResources.blockedTypes.clear()
                    return resultRunInstructions
                }
            } catch
                (error) {
                resultRunInstructions = {
                    "message": `Error ${error}`,
                    "contextId": contextId
                }
                pluginBlockResources.blockedTypes.clear()
                logger.error(error)
                return resultRunInstructions
            }
        }

    }


    async function getResponseByContextPage(page, argsJson) {
        const contextId = argsJson.context_id
        const found = await redis.exists(contextId)
        let getInResponse;
        if (found === 1){
            const responseFromRedis = await redis.get(contextId)
            logger.info(`Key from 2fa founded: ${contextId}`)
            getInResponse = JSON.parse(responseFromRedis)
            await redis.del(contextId)
        }else {
            getInResponse = new GetInResponse(argsJson)
        }
        if (getInResponse !== null){
            const response = new Response();
            response.contextId = contextId
            logger.info(`Creating response and getting extract rules for context: ${contextId}`)
            for (let key in getInResponse) {
                await getContentResponseByKey(key, getInResponse, page, response, responsePage)
            }
            return response;
        }else {
            logger.error(`GetInResponse is null in context: ${contextId}`)
            return null;
        }

    }


    async function closeBrowserContextById(contextId) {
        const context = await getContextById(contextId)
        if (context !== undefined){
            logger.info(`BrowserContext ${contextId} closed`)
            await context.close();
        }
    }


    async function closeBrowser(browser) {
        await browser.close()
    }


    async function configRequestByParams(page, params) {
        const requestConfig = new RequestConfig(params)
        if (Object.keys(requestConfig).length === 0) {
            logger.info(`No configs request`)
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
                                await page.setCookies(requestConfig.cookies)
                                logger.info(`Request config ${key} correctly applied`)
                            }
                        } catch (error) {
                            logger.error(`Error in requestConfig ${key}: ${error}`)
                        }
                        break
                    case 'blockResources':
                        try {
                            if (requestConfig.blockResources !== undefined) {
                                blockResources(page, requestConfig.blockResources)
                                logger.info(`Request config ${key} correctly applied`)
                            }
                        } catch (error) {
                            logger.error(`Error in requestConfig ${key}: ${error}`)
                        }
                        break
                    case 'captcha':
                        try {
                            // logger.info(`Request config ${key} correctly applied`)
                            logger.debug(`${key} still in construction`)
                        } catch (error) {
                            logger.error(`Error in requestConfig ${key}: ${error}`)
                        }
                        break
                    case 'geolocation':
                        try {
                            if (requestConfig.geolocation !== undefined) {
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
                            }
                        } catch (error) {
                            logger.error(`Error in requestConfig ${key}: ${error}`)
                        }
                        break
                    case 'windowHeight':
                        try {
                            if (requestConfig.windowHeight !== undefined) {
                                await page.setViewport({height: requestConfig.windowHeight})
                                logger.info(`Request config ${key} correctly applied`)
                            }
                        } catch (error) {
                            logger.error(`Error in requestConfig ${key}: ${error}`)
                        }
                        break
                    case 'windowWidth':
                        try {
                            if (requestConfig.windowWidth !== undefined) {
                                await page.setViewport({width: requestConfig.windowWidth})
                                logger.info(`Request config ${key} correctly applied`)
                            }
                        } catch (error) {
                            logger.error(`Error in requestConfig ${key}: ${error}`)
                        }
                        break
                    case 'customProxy':
                        try {
                            // logger.info(`Request config ${key} correctly applied`)
                            // logger.debug(`${key} still in construction`)
                        } catch (error) {
                            logger.error(`Error in requestConfig ${key}: ${error}`)
                        }
                        break
                }
            }
        }
    }


    function blockResources(page, resourceTypes) {
        if (resourceTypes.length > 0) {
            logger.info(`Resources to block`)
            for (let resource of resourceTypes) {
                logger.debug("resource " + resource)
                pluginBlockResources.blockedTypes.add(`${resource}`)
            }
        }
    }


    async function getContentResponseByKey(key, getInResponse, page, response, responsePage) {
        const contextId = page.browserContext().id
        switch (key) {
            case "cookies":
                try {
                    getInResponse.cookies === true ? response.cookies = await page.cookies() : response.cookies = {}
                    logger.info(`${key} get it correctly`)
                } catch (error) {
                    logger.error(`Error getting ${key}-->${error}`)
                }
                break
            case "headers":
                try {
                    getInResponse.headers === true ? response.headers = responsePage.headers() : response.headers = {}
                    logger.info(`${key} get it correctly`)
                } catch (error) {
                    logger.error(`Error getting ${key}-->${error}`)
                }
                break
            case "screenshot":
                let screenshot = new Screenshot({
                    id_context: contextId,
                    href: page.url()
                })
                try {
                    const screenshotObject = getInResponse.screenshot
                    const fullPageFlag = screenshotObject["full_page"]
                    const pathImage = `${process.env.IMAGES_PATH_DEV}${contextId}.jpg`
                    if (screenshotObject["active"]){
                        await page.screenshot({path: pathImage, quality: 50, type: 'jpeg', fullPage: fullPageFlag})
                        screenshot.image_path = pathImage;
                        logger.info(`Image pushed to screenshot directory ${contextId}.jpg}`)
                        response.screenshot = pathImage
                        logger.info(`${key} get it correctly`)
                    }
                } catch (error) {
                    logger.error(`Error getting ${key}-->${error}`)
                    screenshot.error = error.toString();
                }
                await screenshot.save()
                break
            case "sourcePage":
                try {
                    getInResponse.sourcePage === true ? response.sourcePage = await page.content() : response.sourcePage = {}
                    logger.info(`${key} get it correctly`)
                } catch (error) {
                    logger.error(`Error getting ${key}-->${error}`)
                }
                break
            case "extractRules":
                try {
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
                } catch (error) {
                    logger.error(`Error getting ${key}-->${error}`)
                }

                break
        }

    }


    async function executeInstruction(command, params, options, page) {
        switch (command) {
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
                    await (await page.waitForSelector(params[0], options)).click()
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
            case "evaluate_sca":
                try {
                    const stringProve = params[0];
                    logger.info(`stringProve: ${stringProve}`)
                    return await page.waitForFunction(`(document.documentElement.outerHTML).includes('${stringProve}')`)
                } catch (error) {
                    logger.error(`Error evaluate_sca ${error}`)
                    return false
                }
            case "wait_for_function":
                try {
                    await page.waitForFunction(params[0], options)
                    return true
                } catch (error) {
                    logger.error(`Error waitForFunction ${error}`)
                    console.log(error)
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

        }
    }


    return Object.freeze({
        initBrowser,
        createBrowserContext,
        createPageByContext,
        getPageByContextId,
        getResponseByContextPage,
        runInstructionsAfter2fa,
        getContextById,
        closeBrowserContextById,
        runInstructions,
        closeBrowser
    })

}




module.exports = botEngine();