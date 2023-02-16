const {v4: uuidv4} = require("uuid");
const os = require("os");
const logger = require('../utils/logger')("")
const {
    ACTION_REQUIRED,
    EXECUTION_SUCCESS,
    NO_EXECUTION,
    EXECUTION_FAILED,
} = require("../utils/constants");
const {BotEngineBrowserContext} = require('../components/engineBrowserContext')
const {GetInResponse} = require("../objects/getInResponse");
const redis = require("../utils/redis");


function EngineController() {

    async function execute(req, res, browser) {
        const data = req.body
        const requestId = uuidv4();
        const requestDescription = data.request_description
        const getInResponse = new GetInResponse(data)
        const logsActive = (getInResponse !== undefined ? (
            getInResponse.logs !== undefined ? getInResponse.logs.active : false
        ) : false)
        const logName = `${requestId}_${Date.now()}`
        const logger_bot = require('../utils/logger')(logsActive === true ? logName : "")
        await redis.set(`logName_${requestId}`, logName)
        const botInstance = BotEngineBrowserContext(browser, logger_bot, requestId)
        try {
            const context = await botInstance.createBrowserContext(browser, requestDescription)
            const page = await botInstance.createPageByContext(context)
            const contextId = context.id
            const result = await botInstance.runInstructions(contextId, page, data)
            let response = {
                hostname: os.hostname(),
                code: 200,
                requestId: requestId,
                contextId: result['contextId'],
                instructionsMessage: result['message'],
                instructionsCode: result['code']
            }
            if (result['code'] === ACTION_REQUIRED.code) {
                const extractRulesResponse = await botInstance.getResponseByContextPage(contextId, data)
                if (extractRulesResponse !== undefined && extractRulesResponse !== {}) {
                    response.extractRulesResponse = extractRulesResponse
                }
                setTimeout(async () => {
                    if (await botInstance.getContextById(contextId) !== undefined){
                        await botInstance.closeBrowserContextById(contextId)
                        logger.info(`BrowserContext ${contextId} closed by timeout`)
                    }else {
                        logger.warn(`BrowserContext ${contextId} already closed or doesn't exist`)
                    }
                }, 300000);
            }
            else if (result['code'] === EXECUTION_SUCCESS.code || result['code'] === NO_EXECUTION.code) {
                const extractRulesResponse = await botInstance.getResponseByContextPage(contextId, data)
                if (extractRulesResponse !== undefined && extractRulesResponse !== {}) {
                    response.extractRulesResponse = extractRulesResponse
                }
                await botInstance.closeBrowserContextById(contextId)
            }
            res.send(response)
        } catch (error) {
            logger.error(error.toString())
            res.send({
                hostname: os.hostname(),
                code: 400,
                requestId: requestId,
                error: error.toString()
            })
        }
    }


    async function solveActionRequired(req, res, browser) {
        const data = req.body
        const contextId = data.context_id
        const requestId = data.request_id
        const requestDescription = data.request_description
        const logName = await redis.get(`logName_${requestId}`)
        const logger_bot = require('../utils/logger')(logName)
        const botInstance = BotEngineBrowserContext(browser, logger_bot, requestId)
        try {
            const page = await botInstance.getPageByContextId(contextId)
            const result = await botInstance.runInstructionsActionRequired(contextId, page, data, requestDescription)
            let response = {
                hostname: os.hostname(),
                code: 200,
                requestId: requestId,
                contextId: contextId,
                instructionsMessage: result['message'],
                instructionsCode: result['code']
            }
            if (result['code'] === ACTION_REQUIRED.code) {
                const extractRulesResponse = await botInstance.getResponseByContextPage(contextId, data)
                if (extractRulesResponse !== undefined && extractRulesResponse !== {}) {
                    response.extractRulesResponse = extractRulesResponse
                }
                setTimeout(async () => {
                    if (await botInstance.getContextById(contextId) !== undefined){
                        await botInstance.closeBrowserContextById(contextId)
                        logger.info(`BrowserContext ${contextId} closed by timeout`)
                    }else {
                        logger.warn(`BrowserContext ${contextId} already closed or doesn't exist`)
                    }
                }, 300000);
            } else if (result['code'] === EXECUTION_SUCCESS.code ||
                result['code'] === EXECUTION_FAILED.code ||
                result['code'] === NO_EXECUTION.code) {
                const extractRulesResponse = await botInstance.getResponseByContextPage(contextId, data)
                if (extractRulesResponse !== undefined && extractRulesResponse !== {}) {
                    response.extractRulesResponse = extractRulesResponse
                }
                await botInstance.closeBrowserContextById(contextId)
            }
            res.send(response)
        } catch (error) {
            logger.error(error.toString())
            console.log(error)
            await botInstance.closeBrowserContextById(contextId)
            res.send({
                hostname: os.hostname(),
                code: 500,
                requestId: requestId,
                error: error.toString()
            })
        }
    }

    async function closeContext(req, res) {
        const data = req.body
        const requestId = uuidv4();
        try {
            const contextId = data.context_id
            await botInstance.closeBrowserContextById(contextId)
            res.send({
                hostname: os.hostname(),
                code: 200,
                requestId: requestId,
                contextId: result['contextId'],
                message: `BrowserContext ${context_id} closed correctly`,
            })
        } catch (error) {
            logger.error(error.toString())
            res.send({
                hostname: os.hostname(),
                code: 400,
                requestId: requestId,
                error: error.toString()
            })
        }
    }


    return Object.freeze({
        execute,
        solveActionRequired,
        closeContext
    })
}


module.exports = EngineController()