const router = require('express').Router();
const FileController = require("../../controllers/fileController");
const {verifyToken} = require('../../middlewares/middlewares')


router.get('/screenshots/:screenshotName', async function (req, res) {
    /* #swagger.auto = true
       #swagger.tags = ['Files']
       #swagger.description = 'Download an image file passing the exact name'
       #swagger.consumes = ['application/json']
       #swagger.parameters['screenshotName'] = {
               in: 'path',
               description: 'Screenshot Name',
               required: true,
               type: 'string'
      }
        #swagger.responses[200] = {
            content: ['application/jpg']
      }
       #swagger.responses[404] = {
            schema:{ $ref: "#/definitions/FileNotFound" }
       }
   */
    await FileController.getScreenshot(req, res)
});

router.get('/logs/:logName', async function (req, res) {
    /* #swagger.auto = true
       #swagger.tags = ['Files']
       #swagger.description = 'Download a log file passing the exact name'
       #swagger.consumes = ['application/json']
       #swagger.parameters['logName'] = {
               in: 'path',
               description: 'Log Name',
               required: true,
               type: 'string'
      }
      #swagger.responses[200] = {
            content: ['text/plain']
      }
      #swagger.responses[404] = {
            schema:{ $ref: "#/definitions/FileNotFound" }
       }
   */
    await FileController.getLog(req, res)
});

router.get('/pdfs/:pdfName', async function (req, res) {
    /* #swagger.auto = true
       #swagger.tags = ['Files']
       #swagger.description = 'Download a pdf file passing the exact name'
       #swagger.consumes = ['application/json']
       #swagger.parameters['pdfName'] = {
               in: 'path',
               description: 'Pdf Name',
               required: true,
               type: 'string'
      }
      #swagger.responses[200] = {
            content: ['text/plain']
      }
       #swagger.responses[404] = {
            schema:{ $ref: "#/definitions/FileNotFound" }
        }
   */
    await FileController.getPdf(req, res)
});

router.get('/log-info/:logRequestId', verifyToken, async function (req, res) {
    /* 	#swagger.auto = true
        #swagger.tags = ['Files']
        #swagger.description = 'Show a json object with meta-info of the log from preview executions'
        #swagger.security = [{"apiKeyAuth": []}]
        #swagger.produces = ['application/json']
        #swagger.consumes = ['application/json']
        #swagger.parameters['logRequestId'] = {
                in: 'path',
                description: 'Log Request ID.',
                required: true,
                type: 'string'
       }
       #swagger.responses[500] = {
            schema:{ $ref: "#/definitions/ExecutionResponseError" }
         }
        #swagger.responses[401] = {
            schema:{ $ref: "#/definitions/ErrorLogin" }
        }
        #swagger.responses[200] = {
            schema:{ $ref: "#/definitions/LogInfoResponse" }
        }
        #swagger.responses[404] = {
            schema:{ $ref: "#/definitions/FileNotFound" }
        }
    */
    await FileController.getLogInfo(req, res)
});

router.get('/screenshot-info/:screenshotRequestId',verifyToken,  async function (req, res) {
    /* 	#swagger.auto = true
        #swagger.tags = ['Files']
        #swagger.description = 'Show a json object with meta-info of the screenshot from preview executions'
        #swagger.security = [{"apiKeyAuth": []}]
        #swagger.produces = ['application/json']
        #swagger.consumes = ['application/json']
        #swagger.parameters['screenshotRequestId'] = {
                in: 'path',
                description: 'Screenshot Request ID.',
                required: true,
                type: 'string'
       }
       #swagger.responses[500] = {
            schema:{ $ref: "#/definitions/ExecutionResponseError" }
         }
        #swagger.responses[401] = {
            schema:{ $ref: "#/definitions/ErrorLogin" }
        }
        #swagger.responses[200] = {
            schema:{ $ref: "#/definitions/ScreenshotInfoResponse" }
        }
        #swagger.responses[404] = {
            schema:{ $ref: "#/definitions/FileNotFound" }
        }
    */
    await FileController.getScreenshotInfo(req, res)
});

router.get('/pdf-info/:pdfRequestId',verifyToken, async function (req, res) {
    /* #swagger.auto = true
       #swagger.tags = ['Files']
       #swagger.description = 'Show a json object with meta-info of the pdf from preview executions'
       #swagger.security = [{"apiKeyAuth": []}]
       #swagger.produces = ['application/json']
       #swagger.consumes = ['application/json']
       #swagger.parameters['pdfRequestId'] = {
               in: 'path',
               description: 'Pdf Request ID.',
               required: true,
               type: 'string'
      }
      #swagger.responses[500] = {
            schema:{ $ref: "#/definitions/ExecutionResponseError" }
         }
        #swagger.responses[401] = {
            schema:{ $ref: "#/definitions/ErrorLogin" }
        }
        #swagger.responses[200] = {
            schema:{ $ref: "#/definitions/PdfInfoResponse" }
        }
        #swagger.responses[404] = {
            schema:{ $ref: "#/definitions/FileNotFound" }
        }
   */
    await FileController.getPdfInfo(req, res)
});

module.exports = router;
