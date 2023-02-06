const Screenshot = require("../models/screenshotModel");
const Log = require("../models/logModel");
const Pdf = require("../models/pdfModel");
const os = require("os");
const logger = require('../utils/logger')("")


function FileController() {


    async function getScreenshot(req, res){
        try {
            const requestId = req.query.image_request_id
            let response = {
                hostname: os.hostname()
            }
            Screenshot.findOne({idRequest: requestId}).lean().exec(function (err, doc) {
                if (doc !== null){
                    response['message'] = `Screenshot fetched correctly`
                    response['screenshot'] = doc
                    logger.info(`Document ${JSON.stringify(doc)} fetched correctly`)
                }else {
                    response['message'] = `Screenshot not found`
                }
                res.send(response);
            });
        } catch (error) {
            logger.error(error.toString())
            res.send({error: JSON.stringify(error)})
        }
    }

    async function getPdf(req, res){
        try {
            const requestId = req.query.pdf_request_id
            let response = {
                hostname: os.hostname()
            }
            Pdf.findOne({idRequest: requestId}).lean().exec(function (err, doc) {
                if (doc !== null){
                    response['message'] = `Pdf fetched correctly`
                    response['pdf'] = doc
                    logger.info(`Document ${JSON.stringify(doc)} fetched correctly`)
                }else {
                    response['message'] = `Pdf not found`
                }
                res.send(response);
            });
        } catch (error) {
            logger.error(error.toString())
            res.send({error: JSON.stringify(error)})
        }
    }

    async function getLog(req, res){
        try {
            const requestId = req.query.log_request_id
            let response = {
                hostname: os.hostname(),
            }
            Log.findOne({idRequest: requestId}).lean().exec(function (err, doc) {
                if (doc !== null){
                    response['message'] = `Log fetched correctly`
                    response['log'] = doc
                    logger.info(`Document ${JSON.stringify(doc)} fetched correctly`)
                }else {
                    response['message'] = `Log not found`
                }
                res.send(response);
            });
        } catch (error) {
            logger.error(error.toString())
            res.send({error: JSON.stringify(error)})
        }
    }

    return Object.freeze({
        getScreenshot,
        getPdf,
        getLog
    })

}

module.exports = FileController()

