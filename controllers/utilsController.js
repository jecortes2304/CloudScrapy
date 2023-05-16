const {v4: uuidv4} = require("uuid");
const os = require("os");
const logger = require('../utils/logger')("")
const {
    CLOUD_SCRAPY_ERRORS,
    LOGIN_REGISTER_ERRORS,
    ROUTES_FILES_V1
} = require("../utils/constants");
const {BotEngineBrowserContext} = require('../components/engineBrowserContext')
const {GetInResponse} = require("../objects/getInResponse");
const redis = require("../utils/redis");
const config = require('config')
const {SECRET_TOKEN} = config.get('tokens')
const serverUrl = config.get('server.server_url')
const pdfsPath = config.get('paths.pdf_path')
const jwt = require("jsonwebtoken");
const {BrowserContext} = require("../objects/browserContext");
const Joi = require("@hapi/joi");
const fs = require("fs");
const Pdf = require("../models/pdfModel");
const {getBrowserContextsByUserIdHelper} = require('./executionController')

function UtilsController() {

    async function htmlToPdfByContent(req, res, browser) {

        const data = req.body
        const {error} = schemaHtmlToPdfByContent.validate(data)
        if (error) {
            return res.status(400).json({
                error: {
                    code: 400,
                    message: error.details[0].message
                }
            })
        }
        if (browser.browserContexts().length <= allowedBrowserContexts) {
            const browserContext = new BrowserContext()
            const pdf = new Pdf()
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
            let context;
            let contextId = ""
            try {
                const userBrowserContexts = await getBrowserContextsByUserIdHelper(userId)
                if (userBrowserContexts.length > 0) {
                    for (let bc of userBrowserContexts) {
                        context = await botInstance.getContextById(bc.contextId)
                        if (context !== undefined) {
                            contextId = bc.contextId
                            break
                        }
                    }
                }

                if (!context) {
                    context = await botInstance.createBrowserContext(browser, requestDescription)
                    contextId = context.id
                    browserContext.userId = userId
                    browserContext.contextId = contextId
                    browserContext.requestId = requestId
                    await redis.set(`browserContext_${requestId}`, JSON.stringify(browserContext))
                }

                const page = await botInstance.createPageByContext(context)

                let response = {
                    hostname: os.hostname(),
                    code: LOGIN_REGISTER_ERRORS.OK_OPERATION.code,
                    message: LOGIN_REGISTER_ERRORS.OK_OPERATION.message,
                    requestId: requestId,
                    contextId: contextId
                }
                await redis.del(`userId_${requestId}`)
                if (data.html_content) {
                    await page.setContent(data.html_content, 'utf8')
                    const buffer = await page.pdf({
                        format: 'A4',
                        margin: {
                            top: "20px",
                            left: "20px",
                            right: "20px",
                            bottom: "20px"
                        },
                        printBackground: true
                    });
                    let result = ''
                    switch (data.output_format) {
                        case 'base64':
                            result = buffer.toString('base64');
                            break
                        case 'binary':
                            result = buffer;
                            break
                        case 'url':
                            pdf.idContext = contextId
                            pdf.idRequest = requestId
                            pdf.urlPage = page.url()
                            const fileName = `${requestId}_${Date.now()}.pdf`
                            const pdfPath = `${pdfsPath}${fileName}`
                            const pdfUrl = `${serverUrl}${ROUTES_FILES_V1.PDF}/${fileName}`
                            pdf.pdfUrl = pdfUrl;
                            fs.writeFileSync(pdfPath, buffer, {encoding: 'utf-8'})
                            await pdf.save()
                            result = pdfUrl
                            break
                    }

                    if (data.next === true) {
                        timeOutFlag = setTimeout(async () => {
                            if (await botInstance.getContextById(contextId) !== undefined) {
                                await botInstance.closeBrowserContextById(contextId)
                                logger.info(`BrowserContext ${contextId} closed by timeout`)
                            } else {
                                logger.warn(`BrowserContext ${contextId} already closed or doesn't exist`)
                            }
                        }, 150000);
                        await redis.set(`idTimeout_${contextId}`, timeOutFlag)
                    } else {
                        await botInstance.closeBrowserContextById(contextId)
                    }
                    response.result = result
                    res.status(200).send(response)
                }
            } catch (error) {
                logger.error(error.toString())
                pdf.error = error.toString()
                await pdf.save()
                await botInstance.closeBrowserContextById(contextId)
                return res.status(500).json({
                    hostname: os.hostname(),
                    code: LOGIN_REGISTER_ERRORS.INTERNAL_SERVER_ERROR.code,
                    message: LOGIN_REGISTER_ERRORS.INTERNAL_SERVER_ERROR.message,
                    requestId: requestId,
                    error: error.toString()
                })
            }
        } else {
            return res.status(429).json({
                hostname: os.hostname(),
                code: CLOUD_SCRAPY_ERRORS.BROWSERS_CONTEXTS_LIMIT_EXCEED.code,
                message: CLOUD_SCRAPY_ERRORS.BROWSERS_CONTEXTS_LIMIT_EXCEED.message,
            })
        }

    }


    const schemaHtmlToPdfByContent = Joi.object({
        request_description: Joi.string().allow('').required(),
        html_content: Joi.string().required(),
        output_format: Joi.string().valid('binary', 'base64', 'url').required(),
        next: Joi.boolean().required()
    });


    function getUserIdFromToken(req) {
        const token = req.header('X-API-Key')
        const user = jwt.verify(token, SECRET_TOKEN)
        return user.id
    }


    return Object.freeze({
        htmlToPdfByContent
    })
}


module.exports = UtilsController()