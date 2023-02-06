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
// const EngineBrowser = require("../components/engineBrowser");
// const User = require("../models/userModel");
// const jwt = require("jsonwebtoken");
// const puppeteer = require("puppeteer-extra");


function EngineController() {


    // async function initBrowser(req, res) {
    //     try {
    //         const result = await getUserByRequest(req);
    //         if (result.code === 200) {
    //             let user = result.data
    //             const initResult = await EngineBrowser.initBrowser(user._id)
    //             if (initResult.code === 200){
    //                 res.send({
    //                     code: initResult.code,
    //                     message: initResult.message
    //                 })
    //             }else {
    //                 res.send({
    //                     code: initResult.code,
    //                     message: initResult.message
    //                 })
    //             }
    //         }else {
    //             res.send({
    //                 code: result.code,
    //                 message: result.error
    //             })
    //         }
    //     } catch (error) {
    //         logger.error(error.toString())
    //         res.send({
    //             code: 500,
    //             error: `Error: ${error.toString()}`,
    //             message: 'Internal Server Error'
    //         })
    //     }
    // }


    // async function closeBrowser(req, res) {
    //     try {
    //         const result = await getUserByRequest(req);
    //         if (result.code === 200) {
    //             const user = result.data
    //             const browser = await puppeteer.connect({browserWSEndpoint: user.browserUrl})
    //             await EngineBrowser.closeBrowser(browser)
    //             let userToUpdate = await User.findOne({_id: user._id})
    //             userToUpdate.browserUrl = ""
    //             await userToUpdate.save()
    //             res.send({
    //                 code: 200,
    //                 message: `Browser ${browser.target()._targetId} closed correctly`
    //             })
    //         } else {
    //             logger.error(error.toString())
    //             res.send({
    //                 code: result.code,
    //                 error: result.error
    //             })
    //         }
    //     } catch (error) {
    //         logger.error(error.toString())
    //         res.send({
    //             code: 500,
    //             error: error.toString(),
    //             message: 'Internal Server Error'
    //         })
    //     }
    // }


    async function execute(req, res, browser) {
        const data = req.body
        // let browser;
        // try {
        //     browser = await getBrowserByUser(req)
        // } catch (error) {
        //     res.send({
        //         code: 400,
        //         message: error.toString()
        //     })
        // }
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
                const resultPage = result['page']
                extractRulesResponse = await botInstance.getResponseByContextPage(contextId, resultPage, data)
                if (extractRulesResponse !== undefined && extractRulesResponse !== {}) {
                    response.extractRulesResponse = extractRulesResponse
                }
                setTimeout(async () => {
                    await botInstance.closeBrowserContextById(contextId)
                    logger.warn(`BrowserContext ${contextId} closed by timeout`)
                }, 300000);
            }
            else if (result['code'] === EXECUTION_SUCCESS.code || result['code'] === NO_EXECUTION.code) {
                const resultPage = result['page']
                extractRulesResponse = await botInstance.getResponseByContextPage(contextId, resultPage, data)
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
            let extractRulesResponse;
            let response = {
                hostname: os.hostname(),
                code: 200,
                requestId: requestId,
                contextId: contextId,
                instructionsMessage: result['message'],
                instructionsCode: result['code']
            }
            if (result['code'] === ACTION_REQUIRED.code) {
                const resultPage = result['page']
                extractRulesResponse = await botInstance.getResponseByContextPage(contextId, resultPage, data)
                if (extractRulesResponse !== undefined && extractRulesResponse !== {}) {
                    response.extractRulesResponse = extractRulesResponse
                }
                setTimeout(async () => {
                    await botInstance.closeBrowserContextById(contextId)
                    logger.warn(`BrowserContext ${contextId} closed by timeout`)
                }, 300000);
            } else if (result['code'] === EXECUTION_SUCCESS.code ||
                result['code'] === EXECUTION_FAILED.code ||
                result['code'] === NO_EXECUTION.code) {
                const resultPage = result['page']
                extractRulesResponse = await botInstance.getResponseByContextPage(contextId, resultPage, data)
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


    // async function execute2Fa(req, res, browser) {
    //     // const browser = await getBrowserByUser(req)
    //     const data = req.body
    //     const contextId = data.context_id
    //     const requestId = data.request_id
    //     const requestDescription = data.request_description
    //     const logName = await redis.get(`logName_${requestId}`)
    //     const logger_bot = require('../utils/logger')(logName)
    //     const botInstance = BotEngineBrowserContext(browser, logger_bot, requestId)
    //     try {
    //         const page = await botInstance.getPageByContextId(contextId)
    //         const result = await botInstance.runInstructionsAfter2fa(contextId, page, data, requestDescription)
    //         let extractRulesResponse;
    //         let response = {
    //             hostname: os.hostname(),
    //             code: 200,
    //             requestId: requestId,
    //             contextId: result['contextId'],
    //             instructionsMessage: result['message'],
    //             instructionsCode: result['code']
    //         }
    //         if (result['code'] === EXECUTION_SUCCESS.code || EXECUTION_FAILED.code || NO_EXECUTION.code) {
    //             const resultPage = result['page']
    //             extractRulesResponse = await botInstance.getResponseByContextPage(contextId, resultPage, data)
    //             if (extractRulesResponse !== undefined && extractRulesResponse !== {}) {
    //                 response.extractRulesResponse = extractRulesResponse
    //             }
    //         }
    //         await botInstance.closeBrowserContextById(contextId)
    //         res.send(response)
    //     } catch (error) {
    //         logger.error(error.toString())
    //         console.log(error)
    //         await botInstance.closeBrowserContextById(contextId)
    //         res.send({
    //             hostname: os.hostname(),
    //             code: 400,
    //             requestId: requestId,
    //             error: error.toString()
    //         })
    //     }
    // }


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


    // async function getBrowserByUser(req) {
    //     try {
    //         const user = await getUserByRequest(req)
    //         if (user) {
    //             return await puppeteer.connect({browserWSEndpoint: user.browserUrl})
    //         }
    //     } catch (error) {
    //         logger.error(error.toString())
    //         return {
    //             code: 400,
    //             message: error.toString()
    //         }
    //     }
    // }


    // async function getUserByRequest(req) {
    //     try {
    //         const token = req.header('X-API-Key')
    //         const payload = jwt.verify(token, process.env.SECRET_TOKEN, {ignoreExpiration: true});
    //         const user = await User.findOne({_id: payload.id}).lean();
    //         return {
    //             code: 200,
    //             data: user,
    //         }
    //     } catch (error) {
    //         logger.error(error.toString())
    //         return {
    //             code: 400,
    //             error: error.toString(),
    //         }
    //     }
    // }


    return Object.freeze({
        execute,
        solveActionRequired,
        // execute2Fa,
        closeContext
    })
}


module.exports = EngineController()