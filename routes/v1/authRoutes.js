const router = require('express').Router();
const AuthController = require('../../controllers/authControllers')
const {isRoot, verifyToken} = require('../../middlewares/middlewares')

router.post('/register', [isRoot, verifyToken], async (req, res) => {
    /*  #swagger.auto = false
        #swagger.tags = ['Auth']
        #swagger.description = 'Endpoint to sign up'
        #swagger.security = [{
               "apiKeyAuth": []
        }]
        #swagger.produces = ['application/json']
        #swagger.consumes = ['application/json']

        #swagger.requestBody['obj'] = {
            required: true,
            schema: { $ref: '#/definitions/RegisterUser' }
        }
        #swagger.responses[200] = {
            schema:{ $ref: "#/definitions/RegisterOk" }
        }
        #swagger.responses[400] = {
            schema:{ $ref: "#/definitions/ErrorBadRequest" }
        }
        #swagger.responses[401] = {
            schema:{ $ref: "#/definitions/ErrorLogin" }
        }
        #swagger.responses[403] = {
            schema:{ $ref: "#/definitions/ErrorForbidden" }
        }
        #swagger.responses[404] = {
            schema:{ $ref: "#/definitions/ErrorNotFound" }
        }
        #swagger.responses[500] = {
            schema:{ $ref: "#/definitions/ErrorInternalServer" }
        }
    */
    await AuthController.registerUser(req, res)
})

router.post('/login', async (req, res) => {
    /*  #swagger.auto = true
        #swagger.tags = ['Auth']
        #swagger.description = 'Endpoint to sign in and get token'

        #swagger.produces = ['application/json']
        #swagger.consumes = ['application/json']

        #swagger.requestBody['obj'] = {
            required: true,
            schema: { $ref: '#/definitions/LoginUser' }
        }
        #swagger.responses[200] = {
            schema:{ $ref: "#/definitions/LoginOk" }
        }
        #swagger.responses[400] = {
            schema:{ $ref: "#/definitions/ErrorBadRequest" }
        }
        #swagger.responses[401] = {
            schema:{ $ref: "#/definitions/ErrorLogin" }
        }
        #swagger.responses[404] = {
            schema:{ $ref: "#/definitions/ErrorNotFound" }
        }
        #swagger.responses[500] = {
            schema:{ $ref: "#/definitions/ErrorInternalServer" }
        }
    */
    await AuthController.loginUser(req, res)
})


module.exports = router;