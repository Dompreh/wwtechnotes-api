const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)
//creating user controller
router.route('/')
    .get(userController.getAllUsers)//read
    .post(userController.createNewUser)//create
    .patch(userController.updateUser)//update
    .delete(userController.deleteUser)//delete

module.exports = router