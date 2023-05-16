const router = require('express').Router();
const UtilsController = require('../../controllers/utilsController')
const {verifyToken} = require('../../middlewares/middlewares')
const BrowserServiceApi = require("../../components/engineBrowserService");


router.post('/htmlToPdf_by_content', verifyToken, async function (req, res) {
     /*	#swagger.auto = true
        #swagger.tags = ['Utils']
        #swagger.description = 'Convert html to pdf by sending a text html'
        #swagger.security = [{"apiKeyAuth": []}]
        #swagger.produces = ['application/json']
        #swagger.consumes = ['application/json']
        #swagger.requestBody['obj'] = {
            required: true,
            schema: { $ref: '#/definitions/HtmlToPdfByContent' }
        }
        #swagger.responses[500] = {
            schema:{ $ref: "#/definitions/ExecutionResponseError" }
         }
        #swagger.responses[401] = {
            schema:{ $ref: "#/definitions/ErrorLogin" }
        }
        #swagger.responses[429] = {
            schema:{ $ref: "#/definitions/ToManyRequests" }
        }
         #swagger.responses[400] = {
            schema:{ $ref: "#/definitions/ErrorBadRequest" }
        }
        #swagger.responses[200] = {
            schema:{ $ref: "#/definitions/HtmlTpPdfByContentResponse" }
        }
     */
    const browser = await BrowserServiceApi.getBrowserInstance()
    await UtilsController.htmlToPdfByContent(req, res, browser)
});

module.exports = router;