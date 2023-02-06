const router = require('express').Router();
const UserController = require('../controllers/userController')



router.post('/register', async (req, res) => {
  /* 	#swagger.tags = ['Users']
        #swagger.description = 'Endpoint to handle users' */

  await UserController.registerUser(req,res)
})


router.post('/login', async (req, res) => {
  /* 	#swagger.tags = ['Users']
        #swagger.description = 'Endpoint to handle users' */

  await UserController.loginUser(req,res)
})




module.exports = router;
