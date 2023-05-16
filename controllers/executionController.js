const {v4: uuidv4} = require("uuid");
const os = require("os");
const logger = require('../utils/logger')("")
const {CLOUD_SCRAPY_ERRORS, LOGIN_REGISTER_ERRORS} = require("../utils/constants");
const {BotEngineBrowserContext} = require('../components/engineBrowserContext')
const {GetInResponse} = require("../objects/getInResponse");
const redis = require("../utils/redis");
const config = require('config')
const {SECRET_TOKEN} = config.get('tokens')
const allowedBrowserContexts = config.get('limits.browsers_contexts_allowed')
const jwt = require("jsonwebtoken");
const {BrowserContext} = require('../objects/browserContext')
const Joi = require("@hapi/joi");

function ExecutionController() {

    async function execute(req, res, browser) {
        const data = req.body
        const {error} = schemaExecution.validate(data)
        if (error) {
            return res.status(400).json({
                error: {
                    code: 400,
                    message: error.details[0].message
                }
            })
        }

        if (browser.browserContexts().length <= allowedBrowserContexts){
            const browserContext = new BrowserContext()
            let timeOutFlag;
            const requestId = uuidv4();
            const requestDescription = data.request_description
            const userId = getUserIdFromToken(req)
            const getInResponse = new GetInResponse(data)
            const logsActive = (getInResponse !== undefined ? (
                getInResponse.logs !== undefined ? getInResponse.logs.active : false
            ) : false)
            const logName = `${requestId}_${Date.now()}`
            const logger_bot = require('../utils/logger')(logsActive === true ? logName : "")
            await redis.set(`logName_${requestId}`, logName)
            await redis.set(`userId_${requestId}`, userId)
            const botInstance = BotEngineBrowserContext(browser, logger_bot, requestId)
            const context = await botInstance.createBrowserContext(browser, requestDescription)
            const contextId = context.id
            browserContext.userId = userId
            browserContext.contextId = contextId
            browserContext.requestId = requestId

            await redis.set(`browserContext_${requestId}`, JSON.stringify(browserContext))
            try {
                const page = await botInstance.createPageByContext(context)
                const result = await botInstance.runInstructions(contextId, page, data)
                let response = {
                    hostname: os.hostname(),
                    requestId: requestId,
                    contextId: result['contextId'],
                    instructionsMessage: result['message'],
                    instructionsCode: result['code']
                }
                if (result['code'] === CLOUD_SCRAPY_ERRORS.ACTION_REQUIRED.code) {
                    const extractRulesResponse = await botInstance.getResponseByContextPage(contextId, data)
                    if (extractRulesResponse !== undefined && extractRulesResponse !== {}) {
                        response.executionResult = extractRulesResponse
                    }
                    timeOutFlag = setTimeout(async () => {
                        if (await botInstance.getContextById(contextId) !== undefined) {
                            await botInstance.closeBrowserContextById(contextId)
                            logger.info(`BrowserContext ${contextId} closed by timeout`)
                        } else {
                            logger.warn(`BrowserContext ${contextId} already closed or doesn't exist`)
                        }
                    }, 150000);
                    await redis.set(`idTimeout_${contextId}`, timeOutFlag)
                } else if (result['code'] === CLOUD_SCRAPY_ERRORS.EXECUTION_SUCCESS.code ||
                    result['code'] === CLOUD_SCRAPY_ERRORS.EXECUTION_FAILED.code ||
                    result['code'] === CLOUD_SCRAPY_ERRORS.NO_EXECUTION.code) {
                    const extractRulesResponse = await botInstance.getResponseByContextPage(contextId, data)
                    if (extractRulesResponse !== undefined && extractRulesResponse !== {}) {
                        response.executionResult = extractRulesResponse
                    }
                    await botInstance.closeBrowserContextById(contextId)
                }
                return res.status(200).json(response)
            } catch (error) {
                logger.error(error.toString())
                await botInstance.closeBrowserContextById(contextId)
                return res.status(500).json({
                    hostname: os.hostname(),
                    code: LOGIN_REGISTER_ERRORS.INTERNAL_SERVER_ERROR.code,
                    message: LOGIN_REGISTER_ERRORS.INTERNAL_SERVER_ERROR.message,
                    requestId: requestId,
                    error: error.toString()
                })
            }
        }else {
            return res.status(429).json({
                hostname: os.hostname(),
                code: CLOUD_SCRAPY_ERRORS.BROWSERS_CONTEXTS_LIMIT_EXCEED.code,
                message: CLOUD_SCRAPY_ERRORS.BROWSERS_CONTEXTS_LIMIT_EXCEED.message,
            })
        }

    }

    async function solveActionRequired(req, res, browser) {
        const data = req.body
        const {error} = schemaExecutionSolveRequired.validate(data)
        if (error) {
            return res.status(400).json({
                error: {
                    code: 400,
                    message: error.details[0].message
                }
            })
        }
        let timeOutFlag;
        const contextId = data.context_id
        const requestId = data.request_id
        const userId = getUserIdFromToken(req)
        await redis.set(`userId_${requestId}`, userId)
        const requestDescription = data.request_description
        const logName = await redis.get(`logName_${requestId}`)
        const logger_bot = require('../utils/logger')(logName)
        const botInstance = BotEngineBrowserContext(browser, logger_bot, requestId)
        try {
            const contextExist = await botInstance.getContextById(contextId)
            if (contextExist) {
                const page = await botInstance.getPageByContextId(contextId)
                const result = await botInstance.runInstructionsActionRequired(contextId, page, data, requestDescription)
                let response = {
                    hostname: os.hostname(),
                    requestId: requestId,
                    contextId: contextId,
                    instructionsMessage: result['message'],
                    instructionsCode: result['code']
                }
                await redis.del(`userId_${requestId}`)
                if (result['code'] === CLOUD_SCRAPY_ERRORS.ACTION_REQUIRED.code) {
                    const extractRulesResponse = await botInstance.getResponseByContextPage(contextId, data)
                    if (extractRulesResponse !== undefined && extractRulesResponse !== {}) {
                        response.executionResult = extractRulesResponse
                    }
                    timeOutFlag = setTimeout(async () => {
                        if (await botInstance.getContextById(contextId) !== undefined) {
                            await botInstance.closeBrowserContextById(contextId)
                            logger.info(`BrowserContext ${contextId} closed by timeout`)
                        } else {
                            logger.warn(`BrowserContext ${contextId} already closed or doesn't exist`)
                        }
                    }, 150000);
                    await redis.set(`idTimeout_${contextId}`, timeOutFlag)
                } else if (result['code'] === CLOUD_SCRAPY_ERRORS.EXECUTION_SUCCESS.code ||
                    result['code'] === CLOUD_SCRAPY_ERRORS.EXECUTION_FAILED.code ||
                    result['code'] === CLOUD_SCRAPY_ERRORS.NO_EXECUTION.code) {
                    const extractRulesResponse = await botInstance.getResponseByContextPage(contextId, data)
                    if (extractRulesResponse !== undefined && extractRulesResponse !== {}) {
                        response.executionResult = extractRulesResponse
                    }
                    await botInstance.closeBrowserContextById(contextId)
                }
                res.status(200).json(response)
            } else {
                const response = {
                    hostname: os.hostname(),
                    requestId: requestId,
                    contextId: contextId,
                    code: LOGIN_REGISTER_ERRORS.NOT_FOUND.code,
                    message: `${LOGIN_REGISTER_ERRORS.NOT_FOUND.message}: The context doesn't exist`
                }
                res.status(404).json(response)
            }
        } catch (error) {
            logger.error(error.toString())
            await botInstance.closeBrowserContextById(contextId)
            res.status(500).json({
                hostname: os.hostname(),
                code: LOGIN_REGISTER_ERRORS.INTERNAL_SERVER_ERROR.code,
                message: LOGIN_REGISTER_ERRORS.INTERNAL_SERVER_ERROR.message,
                requestId: requestId,
                error: error.toString()
            })
        }
    }

    async function closeContext(req, res, browser) {
        const contextId = req.params.contextId
        const logger_bot = require('../utils/logger')("")
        const botInstance = BotEngineBrowserContext(browser, logger_bot, "")
        try {
            const browserClosed = await botInstance.closeBrowserContextById(contextId)
            let response = {
                hostname: os.hostname(),
                code: 200,
                contextId: contextId,
                message: `BrowserContext ${contextId} closed correctly`,
            }
            if (browserClosed === false) {
                response.code = 404
                response.message = `BrowserContext ${contextId} doesn't exist`
            }
            return res.status(response.code).send(response)

        } catch (error) {
            logger.error(error.toString())
            return res.status(500).send({
                hostname: os.hostname(),
                code: LOGIN_REGISTER_ERRORS.INTERNAL_SERVER_ERROR.code,
                message: LOGIN_REGISTER_ERRORS.INTERNAL_SERVER_ERROR.message,
                requestId: requestId,
                error: error.toString()
            })
        }
    }

    async function getAllBrowserContexts(req, res) {
        try {
            const browserContexts = await getAllBrowserContextsHelper()

            const response = {
                hostname: os.hostname(),
                statusCode: LOGIN_REGISTER_ERRORS.OK_OPERATION.code,
                statusMessage: LOGIN_REGISTER_ERRORS.OK_OPERATION.message,
                result: {
                    total: browserContexts.length,
                    browserContexts: browserContexts.map((value) => JSON.parse(value))
                }
            }
            res.status(200).json(response)
        } catch (error) {
            logger.error(error.toString())
            await botInstance.closeBrowserContextById(contextId)
            return res.status(500).json({
                hostname: os.hostname(),
                code: LOGIN_REGISTER_ERRORS.INTERNAL_SERVER_ERROR.code,
                message: LOGIN_REGISTER_ERRORS.INTERNAL_SERVER_ERROR.message,
                requestId: requestId,
                error: error.toString()
            })
        }
    }

    async function getBrowserContextsByUserId(req, res) {
        try {
            const userId = req.params.userId

            const userBrowsersContexts = await getBrowserContextsByUserIdHelper(userId)

            const response = {
                hostname: os.hostname(),
                statusCode: LOGIN_REGISTER_ERRORS.OK_OPERATION.code,
                statusMessage: LOGIN_REGISTER_ERRORS.OK_OPERATION.message,
                result: {
                    total: userBrowsersContexts.length,
                    browserContexts: userBrowsersContexts.map((value) => JSON.parse(value))
                }
            }
            res.status(200).json(response)
        } catch (error) {
            logger.error(error.toString())
            await botInstance.closeBrowserContextById(contextId)
            return res.status(500).json({
                hostname: os.hostname(),
                code: LOGIN_REGISTER_ERRORS.INTERNAL_SERVER_ERROR.code,
                message: LOGIN_REGISTER_ERRORS.INTERNAL_SERVER_ERROR.message,
                requestId: requestId,
                error: error.toString()
            })
        }
    }


    const getAllBrowserContextsHelper = async () => {
        const browserContextsKeys = await redis.keys('*browserContext*')
        const browserContexts = []
        for (let key of browserContextsKeys) {
            if (await redis.exists(key)) {
                let browserContext = await redis.get(key)
                browserContexts.push(browserContext)
            }
        }

        return browserContexts
    }

    const getBrowserContextsByUserIdHelper = async (userId) => {
        const browserContextsKeys = await redis.keys('*browserContext*')
        let userBrowsersContexts = []
        for (let key of browserContextsKeys) {
            if (await redis.exists(key)) {
                let browserContext = await redis.get(key)
                let bc = JSON.parse(browserContext)
                if (bc.userId === userId) {
                    userBrowsersContexts.push(browserContext)
                }
            }
        }

        return userBrowsersContexts
    }

    function getUserIdFromToken(req) {
        const token = req.header('X-API-Key')
        const user = jwt.verify(token, SECRET_TOKEN)
        return user.id
    }


    const schemaExecution = Joi.object({
        request_description: Joi.string().min(5).max(255).required(),
        send_in_request: Joi.object({
            url: Joi.string().max(255).required(),
            options: Joi.object().required(),
            instructions: Joi.array().items(
                Joi.object({
                    command: Joi.string().max(255).required().valid("goto", "click", "click_and_wait",
                        "wait_for_selector", "wait_for_selector_and_click", "wait_selector_click_wait_nav",
                        "wait_for_xpath", "wait_for_function", "wait_for_navigation", "evaluate", "verify",
                        "xpath", "sec_type", "type", "keyboard_press", "keyboard_down", "keyboard_up"),
                    params: Joi.array().max(3).required(),
                    options: Joi.object().required()
                })).required(),
        }).required(),
        get_in_response: Joi.object({
            cookies: Joi.boolean(),
            headers: Joi.boolean(),
            html_to_pdf: Joi.boolean(),
            logs: Joi.object({
                active: Joi.boolean().required(),
                full_logs: Joi.boolean().required()
            }),
            screenshot: Joi.object({
                active: Joi.boolean().required(),
                full_page: Joi.boolean().required()
            }),
            source_page: Joi.boolean().required(),
            extract_rules: Joi.array().items(
                Joi.object({
                    name: Joi.string().required(),
                    selector: Joi.string().required(),
                    attribute: Joi.string().required()
                })).required()
        }),
        request_config: Joi.object({
            headers: Joi.alternatives().try(Joi.object(), Joi.array()),
            cookies: Joi.alternatives().try(Joi.object(), Joi.array()),
            block_resources: Joi.array().items((Joi.string())),
            captcha: Joi.boolean(),
            geolocation: Joi.object({
                latitude: Joi.string().required(),
                longitude: Joi.string().required()
            }),
            user_agent: Joi.string().min(10),
            view_port: Joi.object({
                width: Joi.string().required(),
                height: Joi.string().required()
            }),
            custom_proxy: Joi.string()
        })
    });

    const schemaExecutionSolveRequired = Joi.object({
        context_id: Joi.string().min(32).max(32).required(),
        request_id: Joi.string().min(36).max(36).required(),
        request_description: Joi.string().min(5).max(255).required(),
        send_in_request: Joi.object({
            instructions: Joi.array().items(
                Joi.object({
                    command: Joi.string().max(255).required().valid("goto", "click", "click_and_wait",
                        "wait_for_selector", "wait_for_selector_and_click", "wait_selector_click_wait_nav",
                        "wait_for_xpath", "wait_for_function", "wait_for_navigation", "evaluate", "verify",
                        "xpath", "sec_type", "type", "keyboard_press", "keyboard_down", "keyboard_up"),
                    params: Joi.array().max(3).required(),
                    options: Joi.object().required()
                })).required(),
        }).required()
    });


    return Object.freeze({
        execute,
        solveActionRequired,
        getAllBrowserContexts,
        getBrowserContextsByUserId,
        getBrowserContextsByUserIdHelper,
        closeContext
    })
}


module.exports = ExecutionController()