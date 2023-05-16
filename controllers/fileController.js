const Screenshot = require("../models/screenshotModel");
const Log = require("../models/logModel");
const Pdf = require("../models/pdfModel");
const os = require("os");
const logger = require('../utils/logger')("")
const fs = require('fs')
const config = require("config");
const {LOGIN_REGISTER_ERRORS} = require("../utils/constants");
const {images_path, logs_path, pdf_path} = config.get('paths')


function FileController() {

    async function getScreenshot(req, res) {
        const imageName = req.params.screenshotName
        const image = `${images_path}${imageName}`
        fs.readFile(image, function (err, data) {
            if (err) {
                return res.status(404).send({
                    code: 404,
                    message: "File not found"
                });
            } else {
                res.writeHead(200, {'Content-Type': 'image/jpg'});
                return res.status(200).send(data);
            }
        });
    }

    async function getPdf(req, res) {
        const pdfName = req.params.pdfName
        const pdf = `${pdf_path}${pdfName}`
        fs.readFile(pdf, function (err, data) {
            if (err) {
                return res.status(404).send({
                    code: 404,
                    message: "File not found"
                });
            } else {
                res.writeHead(200, {'Content-Type': 'text/plain'});
                return res.status(200).send(data);
            }
        });
    }

    async function getLog(req, res) {
        const logName = req.params.logName
        const log = `${logs_path}${logName}`
        fs.readFile(log, function (err, data) {
            if (err) {
                return res.status(404).send({
                    code: 404,
                    message: "File not found"
                });
            } else {
                res.writeHead(200, {'Content-Type': 'text/plain'});
                return res.status(200).send(data);
            }
        });
    }

    async function getScreenshotInfo(req, res) {
        try {
            const requestId = req.params.screenshotRequestId
            let response = {
                hostname: os.hostname()
            }
            Screenshot.findOne({idRequest: requestId}).lean().exec(function (err, doc) {
                if (doc !== null) {
                    response['message'] = `Screenshot fetched correctly`
                    response['code'] = 200
                    response['screenshot'] = doc
                    logger.info(`Document ${JSON.stringify(doc)} fetched correctly`)
                    return res.status(200).send(response);
                } else {
                    response['code'] = 404
                    response['message'] = `Screenshot not found`
                    return res.status(404).send(response);
                }
            });
        } catch (error) {
            logger.error(error.toString())
            return res.status(500).json({
                hostname: os.hostname(),
                code: LOGIN_REGISTER_ERRORS.INTERNAL_SERVER_ERROR.code,
                message: LOGIN_REGISTER_ERRORS.INTERNAL_SERVER_ERROR.message,
                error:{error: JSON.stringify(error)}
            })
        }
    }

    async function getPdfInfo(req, res) {
        try {
            const requestId = req.params.pdfRequestId
            let response = {
                hostname: os.hostname()
            }
            Pdf.findOne({idRequest: requestId}).lean().exec(function (err, doc) {
                if (doc !== null) {
                    response['message'] = `Pdf fetched correctly`
                    response['code'] = 200
                    response['pdf'] = doc
                    logger.info(`Document ${JSON.stringify(doc)} fetched correctly`)
                    return res.status(200).send(response);
                } else {
                    response['code'] = 404
                    response['message'] = `Pdf not found`
                    return res.status(404).send(response);
                }
            });
        } catch (error) {
            logger.error(error.toString())
            return res.status(500).json({
                hostname: os.hostname(),
                code: LOGIN_REGISTER_ERRORS.INTERNAL_SERVER_ERROR.code,
                message: LOGIN_REGISTER_ERRORS.INTERNAL_SERVER_ERROR.message,
                error:{error: JSON.stringify(error)}
            })
        }
    }

    async function getLogInfo(req, res) {
        try {
            const requestId = req.params.logRequestId
            let response = {
                hostname: os.hostname(),
            }
            Log.findOne({idRequest: requestId}).lean().exec(function (err, doc) {
                if (doc !== null) {
                    response['message'] = `Log fetched correctly`
                    response['code'] = 200
                    response['log'] = doc
                    logger.info(`Document ${JSON.stringify(doc)} fetched correctly`)
                    return res.status(200).send(response);
                } else {
                    response['code'] = 404
                    response['message'] = `Log not found`
                    return res.status(404).send(response);
                }
            });
        } catch (error) {
            logger.error(error.toString())
            return res.status(500).json({
                hostname: os.hostname(),
                code: LOGIN_REGISTER_ERRORS.INTERNAL_SERVER_ERROR.code,
                message: LOGIN_REGISTER_ERRORS.INTERNAL_SERVER_ERROR.message,
                error:{error: JSON.stringify(error)}
            })
        }
    }

    return Object.freeze({
        getScreenshot,
        getPdf,
        getLog,
        getScreenshotInfo,
        getPdfInfo,
        getLogInfo
    })

}

module.exports = FileController()

