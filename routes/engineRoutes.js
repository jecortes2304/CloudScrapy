const router = require('express').Router();
const Browser = require('../components/engineBrowser')
const EngineController = require('../controllers/engineController')
const mongoDb = require('../utils/mongo');
mongoDb.connect()
let browser;
Browser.initBrowser().then(value => browser = value)



//
// router.put('/init-browser', async function (req, res) {
//     /* 	#swagger.tags = ['Engine']
//          #swagger.description = 'Initiate the browser assigned to the user with its own configurations' */
//
//     /* #swagger.security = [{
//             "apiKeyAuth": []
//     }] */
//     await EngineController.initBrowser(req, res)
// });

// router.delete('/close-browser', async function (req, res) {
//     /* 	#swagger.tags = ['Engine']
//          #swagger.description = 'Close and delete the browser assigned to the user' */
//
//     /* #swagger.security = [{
//             "apiKeyAuth": []
//     }] */
//     await EngineController.closeBrowser(req, res)
// });

// router.post('/execute/2fa', async function (req, res) {
//     /* 	#swagger.tags = ['Engine']
//         #swagger.description = 'Execute a set of instructions in a browserContext waiting for action required ' */
//     /* #swagger.security = [{
//             "apiKeyAuth": []
//     }] */
//     await EngineController.execute2Fa(req, res, browser)
// });


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