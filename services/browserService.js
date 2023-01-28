const {v4: uuidv4} = require("uuid");
const os = require("os");
const logger = require('../utils/logger')("")
const {ACTION_REQUIRED, EXECUTION_SUCCESS, NO_EXECUTION, EXECUTION_FAILED} = require("../utils/constants");
const BotEngine = require('../components/engine')
const {GetInResponse} = require("../objects/getInResponse");


function BrowserService() {


    async function run(data, browser) {
        const requestId = uuidv4();
        const requestDescription = data.request_description
        const getInResponse = new GetInResponse(data)
        const logsActive = (getInResponse !== undefined ? (
                getInResponse.logs !== undefined ? getInResponse.logs.active : false
            ) : false)
        const logger_bot = require('../utils/logger')(logsActive === true ? requestId : "")
        const botInstance = BotEngine.BotEngine(browser, logger_bot, requestId)
        try {
            const context = await botInstance.createBrowserContext(browser, requestDescription)
            const page = await botInstance.createPageByContext(context)
            const contextId = context.id
            const result = await botInstance.runInstructions(contextId, page, data)
            let extractRulesResponse;
            let response = {
                hostname: os.hostname(),
                code: 200,
                requestId: requestId,
                contextId: result['contextId'],
                instructionsMessage: result['message'],
                instructionsCode: result['code']
            }
            if (result['code'] === ACTION_REQUIRED.code) {
                setTimeout(async () => {
                    await botInstance.closeBrowserContextById(contextId)
                    logger.warn(`BrowserContext ${contextId} closed by timeout`)
                }, 300000);
                return response
            } else if (result['code'] === EXECUTION_SUCCESS.code) {
                const resultPage = result['page']
                extractRulesResponse = await botInstance.getResponseByContextPage(contextId, resultPage, data)
                if (extractRulesResponse !== undefined && extractRulesResponse !== {}) {
                    response.extractRulesResponse = extractRulesResponse
                }
                await botInstance.closeBrowserContextById(contextId)
            } else if (result['code'] === NO_EXECUTION.code) {
                const resultPage = result['page']
                extractRulesResponse = await botInstance.getResponseByContextPage(contextId, resultPage, data)
                if (extractRulesResponse !== undefined && extractRulesResponse !== {}) {
                    response.extractRulesResponse = extractRulesResponse
                }
            }
            await botInstance.closeBrowserContextById(contextId)
            return response
        } catch (error) {
            logger.error(error.toString())
            return {
                hostname: os.hostname(),
                code: 400,
                requestId: requestId,
                error: error.toString()
            }
        }
    }


    async function run2Fa(data, browser) {
        const contextId = data.context_id
        const requestId = data.request_id
        const logger_bot = require('../utils/logger')(requestId)
        const botInstance = BotEngine.BotEngine(browser, logger_bot, requestId)
        try {
            const page = await botInstance.getPageByContextId(contextId)
            const result = await botInstance.runInstructionsAfter2fa(contextId, page, data)
            let extractRulesResponse;
            let response = {
                hostname: os.hostname(),
                code: 200,
                requestId: requestId,
                contextId: result['contextId'],
                instructionsMessage: result['message'],
                instructionsCode: result['code']
            }
            if (result['code'] === EXECUTION_SUCCESS.code || EXECUTION_FAILED.code|| NO_EXECUTION.code) {
                const resultPage = result['page']
                extractRulesResponse = await botInstance.getResponseByContextPage(contextId, resultPage, data)
                if (extractRulesResponse !== undefined && extractRulesResponse !== {}) {
                    response.extractRulesResponse = extractRulesResponse
                }
            }
            await botInstance.closeBrowserContextById(contextId)
            return response
        } catch (error) {
            logger.error(error.toString())
            await botInstance.closeBrowserContextById(contextId)
            return {
                hostname: os.hostname(),
                code: 400,
                requestId: requestId,
                error: error.toString()
            }
        }
    }


    async function closeContext(data) {
        const requestId = uuidv4();
        try {
            const contextId = data.context_id
            await botInstance.closeBrowserContextById(contextId)
            return {
                hostname: os.hostname(),
                code: 200,
                requestId: requestId,
                contextId: result['contextId'],
                message: `BrowserContext ${context_id} closed correctly`,
            }
        } catch (error) {
            logger.error(error.toString())
            return {
                hostname: os.hostname(),
                code: 400,
                requestId: requestId,
                error: error.toString()
            }
        }
    }


    return Object.freeze({
        run,
        run2Fa,
        closeContext
    })
}


module.exports = BrowserService()