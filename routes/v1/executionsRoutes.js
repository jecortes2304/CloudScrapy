const router = require('express').Router();
const BrowserServiceApi = require('../../components/engineBrowserService')
const EngineController = require('../../controllers/executionController')
const {isRoot, verifyToken} = require('../../middlewares/middlewares')

router.post('/execute', verifyToken, async function (req, res) {
     /*	#swagger.auto = true
        #swagger.tags = ['Executions']
        #swagger.description = 'Execute a set of instructions in a new browserContext of the user's browser'
        #swagger.security = [{"apiKeyAuth": []}]
        #swagger.produces = ['application/json']
        #swagger.consumes = ['application/json']
        #swagger.requestBody['obj'] = {
            required: true,
            schema: { $ref: '#/definitions/Execution' }
        }
        #swagger.responses[500] = {
            schema:{ $ref: "#/definitions/ExecutionResponseError" }
         }
        #swagger.responses[401] = {
            schema:{ $ref: "#/definitions/ErrorLogin" }
        }
         #swagger.responses[400] = {
            schema:{ $ref: "#/definitions/ErrorBadRequest" }
        }
        #swagger.responses[429] = {
            schema:{ $ref: "#/definitions/ToManyRequests" }
        }
        #swagger.responses[200] = {
            schema:{ $ref: "#/definitions/ExecutionResponse" }
        }

     */
    const browser = await BrowserServiceApi.getBrowserInstance()
    await EngineController.execute(req, res, browser)
});

router.post('/solve-action-required', verifyToken,async function (req, res) {
    /* 	#swagger.auto = true
        #swagger.tags = ['Executions']
        #swagger.description = 'Execute a set of instructions to solve action require in a browserContext by browserContext id'
        #swagger.security = [{"apiKeyAuth": []}]
        #swagger.produces = ['application/json']
        #swagger.consumes = ['application/json']
        #swagger.requestBody['obj'] = {
                required: true,
                schema: { $ref: '#/definitions/ActionRequiredExecution' }
            }
        #swagger.responses[500] = {
            schema:{ $ref: "#/definitions/ExecutionResponseError" }
         }
        #swagger.responses[401] = {
            schema:{ $ref: "#/definitions/ErrorLogin" }
        }
        #swagger.responses[400] = {
            schema:{ $ref: "#/definitions/ErrorBadRequest" }
        }
        #swagger.responses[404] = {
            schema:{ $ref: "#/definitions/ErrorNotFound" }
        }
        #swagger.responses[200] = {
            schema:{ $ref: "#/definitions/ExecutionResponse" }
        }
    */
    const browser = await BrowserServiceApi.getBrowserInstance()
    await EngineController.solveActionRequired(req, res, browser)
});

router.delete('/close-context/:contextId', [verifyToken, isRoot], async function (req, res) {
    /* 	#swagger.auto = true
        #swagger.tags = ['Executions']
        #swagger.description = 'Force browserContext to close and deleted if exist'
        #swagger.security = [{"apiKeyAuth": []}]
        #swagger.produces = ['application/json']
        #swagger.consumes = ['application/json']
        #swagger.parameters['contextId'] = {
            in: 'path',
            description: 'Context ID.',
            required: true,
            type: 'string'
        }
        #swagger.responses[500] = {
            schema:{ $ref: "#/definitions/ExecutionResponseError" }
         }
         #swagger.responses[403] = {
            schema:{ $ref: "#/definitions/ErrorForbidden" }
         }
         #swagger.responses[404] = {
            schema:{ $ref: "#/definitions/ErrorNotFound" }
         }
        #swagger.responses[401] = {
            schema:{ $ref: "#/definitions/ErrorLogin" }
        }
        #swagger.responses[200] = {
            schema:{ $ref: "#/definitions/ExecutionCloseResponse" }
        }
    */
    const browser = await BrowserServiceApi.getBrowserInstance()
    await EngineController.closeContext(req, res, browser)
});

router.get('/all-browser-contexts', isRoot, verifyToken, async function (req, res) {
    /* 	#swagger.auto = true
        #swagger.tags = ['Executions']
        #swagger.description = 'Get all active browser contexts'
        #swagger.security = [{"apiKeyAuth": []}]
        #swagger.produces = ['application/json']

        #swagger.responses[500] = {
            schema:{ $ref: "#/definitions/ErrorInternalServer" }
        }
        #swagger.responses[403] = {
            schema:{ $ref: "#/definitions/ErrorForbidden" }
        }
        #swagger.responses[401] = {
            schema:{ $ref: "#/definitions/ErrorLogin" }
        }
        #swagger.responses[200] = {
            schema:{ $ref: "#/definitions/AllBrowserContextsResponse" }
        }
    */
    const browser = await BrowserServiceApi.getBrowserInstance()
    await EngineController.getAllBrowserContexts(req, res, browser)
});

router.get('/user-browser-contexts/:userId', isRoot, verifyToken, async function (req, res) {
    /* 	#swagger.auto = true
        #swagger.tags = ['Executions']
        #swagger.description = 'Get all active browser contexts by user id'
        #swagger.security = [{"apiKeyAuth": []}]
        #swagger.produces = ['application/json']

        #swagger.responses[500] = {
            schema:{ $ref: "#/definitions/ErrorInternalServer" }
        }
        #swagger.responses[403] = {
            schema:{ $ref: "#/definitions/ErrorForbidden" }
        }
        #swagger.responses[401] = {
            schema:{ $ref: "#/definitions/ErrorLogin" }
        }
        #swagger.responses[200] = {
            schema:{ $ref: "#/definitions/AllBrowserContextsResponse" }
        }
    */
    const browser = await BrowserServiceApi.getBrowserInstance()
    await EngineController.getBrowserContextsByUserId(req, res, browser)
});


module.exports = router;