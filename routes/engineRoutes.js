const router = require('express').Router();
const Browser = require('../components/engineBrowser')
const EngineController = require('../controllers/engineController')
const mongoDb = require('../utils/mongo');
mongoDb.connect()
let browser;
Browser.initBrowser().then(value => browser = value)


router.post('/execute', async function (req, res) {
    /* 	#swagger.tags = ['Engine']
         #swagger.description = 'Execute a set of instructions in a new browserContext of the user's browser' */
    /* #swagger.security = [{
            "apiKeyAuth": []
    }] */
    /*  #swagger.parameters['obj'] = {
                in: 'body',
                description: 'Full execution request parameters',
                schema: {
                    $ref: '#/definitions/Execution'
                }
        } */
    await EngineController.execute(req, res, browser)
});

router.post('/execute/solve-action-required', async function (req, res) {
    /* 	#swagger.tags = ['Engine']
         #swagger.description = 'Execute a set of instructions in a new browserContext of the user's browser' */
    /* #swagger.security = [{
            "apiKeyAuth": []
    }] */
    /*  #swagger.parameters['obj'] = {
                in: 'body',
                description: 'Full execution request parameters',
                schema: {
                    $ref: '#/definitions/Execution'
                }
        } */
    await EngineController.solveActionRequired(req, res, browser)
});

router.delete('/close-context', async function (req, res) {
    /* 	#swagger.tags = ['Engine']
       #swagger.description = 'Force browserContext to close and deleted if exist' */
    /* #swagger.security = [{
            "apiKeyAuth": []
    }] */
    await EngineController.closeContext(req, res)
});




module.exports = router;