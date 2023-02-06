const router = require('express').Router();
const FileController = require("../controllers/fileController");
const fs = require('fs')


router.get('/public/screenshots/:imageName', async function (req, res) {
    /* 	#swagger.tags = ['Files']
           #swagger.description = 'Download an image passing the exact name' */

    /* #swagger.security = [{
            "apiKeyAuth": []
    }] */
    const imageName = req.params.imageName
    const image = `${process.env.IMAGES_PATH}${imageName}`
    fs.readFile(image, function (err, data) {
        if (err) {
            res.send({
                code: 404,
                message: "File not found"
            });
        } else {
            res.writeHead(200, {'Content-Type': 'image/jpg'});
            res.end(data);
        }
    });
});

router.get('/public/logs/:logName', async function (req, res) {
    /* 	#swagger.tags = ['Files']
           #swagger.description = 'Download a log file passing the exact name' */

    /* #swagger.security = [{
            "apiKeyAuth": []
    }] */
    const logName = req.params.logName
    const log = `${process.env.LOGS_PATH}${logName}`
    fs.readFile(log, function (err, data) {
        if (err) {
            res.send({
                code: 404,
                message: "File not found"
            });
        } else {
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end(data);
        }
    });
});


router.get('/public/pdfs/:pdfName', async function (req, res) {
    /* 	#swagger.tags = ['Files']
           #swagger.description = 'Download an image file passing the exact name' */

    /* #swagger.security = [{
            "apiKeyAuth": []
    }] */
    const pdfName = req.params.pdfName
    const pdf = `${process.env.PDF_PATH}${pdfName}`
    fs.readFile(pdf, function (err, data) {
        if (err) {
            res.send({
                code: 404,
                message: "File not found"
            });
        } else {
            res.writeHead(200, {'Content-Type': 'application/images'});
            res.end(data);
        }
    });
});

router.get('/api/log-info', async function (req, res) {
    /* 	#swagger.tags = ['Files']
           #swagger.description = 'Show a log object with meta-info from preview executions' */

    /* #swagger.security = [{
            "apiKeyAuth": []
    }] */
    await FileController.getLog(req, res)
});

router.get('/api/image-info', async function (req, res) {
    /* 	#swagger.tags = ['Files']
         #swagger.description = 'Show an image object with meta-info from preview executions' */

    /* #swagger.security = [{
            "apiKeyAuth": []
    }] */
    await FileController.getScreenshot(req, res)
});


router.get('/api/pdf-info', async function (req, res) {
    /* 	#swagger.tags = ['Files']
         #swagger.description = 'Show an image object with meta-info from preview executions' */

    /* #swagger.security = [{
            "apiKeyAuth": []
    }] */
    await FileController.getPdf(req, res)
});

module.exports = router;
