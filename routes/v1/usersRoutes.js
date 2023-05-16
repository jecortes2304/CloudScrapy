const router = require('express').Router();
const UserController = require('../../controllers/userController')
const {isRoot, verifyToken} = require('../../middlewares/middlewares')

router.post('/refresh-keys-pair/:userId', verifyToken, async (req, res) => {
    /*  #swagger.auto = true
     	#swagger.tags = ['Users']
        #swagger.description = 'Endpoint to refresh the keys pair of user to encrypt sensitive data in request'
        #swagger.security = [{"apiKeyAuth": []}]
        #swagger.produces = ['application/json']
        #swagger.consumes = ['application/json']

        #swagger.responses[500] = {
            schema:{ $ref: "#/definitions/ErrorInternalServer" }
         }
         #swagger.responses[404] = {
            schema:{ $ref: "#/definitions/ErrorNotFound" }
         }
        #swagger.responses[401] = {
            schema:{ $ref: "#/definitions/ErrorLogin" }
        }
        #swagger.responses[204] = {}
     */
    await UserController.refreshKeysPairById(req, res)
})

router.get('/get-user-by-id/:userId', [isRoot, verifyToken], async (req, res) => {
    /*  #swagger.auto = true
        #swagger.tags = ['Users']
        #swagger.description = 'Endpoint to get user by id'
        #swagger.security = [{
           "apiKeyAuth": []
        }]
        #swagger.produces = ['application/json']
        #swagger.consumes = ['application/json']

        #swagger.parameters['userId'] = {
                in: 'path',
                description: 'User ID.',
                required: true,
                type: 'string'
            }
         #swagger.responses[500] = {
            schema:{ $ref: "#/definitions/ErrorInternalServer" }
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
            schema:{ $ref: "#/definitions/UserByParamResponse" }
        }
    */
    await UserController.getUserById(req, res)
})

router.get('/get-user-profile-info', verifyToken, async (req, res) => {
    /*  #swagger.auto = true
        #swagger.tags = ['Users']
        #swagger.description = 'Endpoint to get the logged user profile info'
        #swagger.security = [{
           "apiKeyAuth": []
        }]
        #swagger.produces = ['application/json']
        #swagger.consumes = ['application/json']

        #swagger.responses[500] = {
            schema:{ $ref: "#/definitions/ErrorInternalServer" }
        }
        #swagger.responses[401] = {
            schema:{ $ref: "#/definitions/ErrorLogin" }
        }
        #swagger.responses[200] = {
            schema:{ $ref: "#/definitions/UserByParamResponse" }
        }
    */
    await UserController.getUserProfileInfo(req, res)
})

router.get('/get-user-by-username/:username', [isRoot, verifyToken], async (req, res) => {
    /*  #swagger.auto = true
        #swagger.tags = ['Users']
        #swagger.description = 'Endpoint to get user by username'
        #swagger.security = [{
           "apiKeyAuth": []
        }]
        #swagger.produces = ['application/json']
        #swagger.consumes = ['application/json']

        #swagger.parameters['username'] = {
                in: 'path',
                description: 'Username',
                required: true,
                type: 'string'
        }
         #swagger.responses[500] = {
            schema:{ $ref: "#/definitions/ErrorInternalServer" }
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
            schema:{ $ref: "#/definitions/UserByParamResponse" }
         }
    */
    await UserController.getUserByUsername(req, res)
})

router.get('/all-users', [isRoot, verifyToken], async (req, res) => {
    /*  #swagger.auto = true
        #swagger.tags = ['Users']
        #swagger.description = 'Endpoint to get all users'
        #swagger.security = [{
               "apiKeyAuth": []
        }]
        #swagger.produces = ['application/json']
        #swagger.consumes = ['application/json']

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
            schema:{ $ref: "#/definitions/UsersByParamResponse" }
        }
    */
    await UserController.getAllUsers(req, res)
})

router.delete('/delete-user/:userId', [isRoot, verifyToken], async (req, res) => {
    /*  #swagger.auto = true
        #swagger.tags = ['Users']
        #swagger.description = 'Endpoint to delete user by id'
        #swagger.security = [{
           "apiKeyAuth": []
        }]
        #swagger.produces = ['application/json']
        #swagger.consumes = ['application/json']

        #swagger.parameters['userId'] = {
                in: 'path',
                description: 'User ID',
                required: true,
                type: 'string'
            }

        #swagger.responses[500] = {
            schema:{ $ref: "#/definitions/ErrorInternalServer" }
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
            schema:{ $ref: "#/definitions/UserDeletedResponse" }
        }
    */
    await UserController.deleteUserById(req, res)
})

router.put('/update-user/:userId', [isRoot, verifyToken], async (req, res) => {
    /*  #swagger.auto = true
        #swagger.tags = ['Users']
        #swagger.description = 'Endpoint to update user by id'
        #swagger.security = [{
               "apiKeyAuth": []
        }]
        #swagger.produces = ['application/json']
        #swagger.consumes = ['application/json']

        #swagger.parameters['userId'] = {
            in: 'path',
            description: 'User ID.',
            required: true,
            type: 'string'
        }
        #swagger.requestBody['obj'] = {
            required: true,
            schema: { $ref: '#/definitions/UpdateUser' }
        }

        #swagger.responses[500] = {
            schema:{ $ref: "#/definitions/ErrorInternalServer" }
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
            schema:{ $ref: "#/definitions/UpdateUserResponse" }
        }
    */
    await UserController.updateUserById(req, res)
})


module.exports = router;
