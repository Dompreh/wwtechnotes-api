const express = require('express')
const router = express.Router()
const noteController = require('../controllers/noteController')
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)
//creating notes controller
router.route('/')
    .get(noteController.getNotes)//read
    .post(noteController.createNewNotes)//create
    .patch(noteController.updateNotes)//update
    .delete(noteController.deleteNotes)//delete

module.exports = router