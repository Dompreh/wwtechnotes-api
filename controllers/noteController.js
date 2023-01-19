const User = require('../models/User')
const Note = require('../models/Note')
const asyncHandler = require('express-async-handler')//use it to reduce try and catch blocks

//@desc Get all notes
//@route GET /notes
//@access Private
const getNotes = asyncHandler(async(req,res) =>{
    const notes = await Note.find().lean()//you only add lean if the data won't be saved
    if(!notes?.length){
        return res.status(400).json({message:"No notes found"})
    }

    //Add username to each note before sending the response
    const noteWithUser = await Promise.all(notes.map(async (note) => {
        const user = await User.findById(note.user).lean().exec()
        return {...note, username: user?.username}
    }))

    res.json(noteWithUser)

})
//@desc Create new notes
//@route POST /notes
//@access Private
const createNewNotes = asyncHandler(async(req,res) =>{
    const {user, title, text} =req.body

    //Confirm data
    if(!user || !title || !text){
       return res.status(400).json({message:'All fields are required'})
    }

     //Check DUPLICATE
     const duplicate = await Note.findOne({title}).collation({locale: 'en', strength:2}).lean().exec()
     
     if(duplicate){
        return res.status(400).json({message:'Duplicate note title'})
     }
     //	"_id": "63b03824986b1482440bf2ca",W
     //"_id": "63b037fa986b1482440bf2c7",T
     const noteObject ={user, title, text}

     const note = await Note.create(noteObject)

     if(note){
        res.status(201).json({message:`New note ${title} created`})
    }
    else{
        res.status(400).json({message:`Invalid note data recieved`})
    }
})

//@desc Update notes
//@route PATCH /notes
//@access Private
const updateNotes = asyncHandler(async(req,res) =>{
    const {id, user, title, text, completed} =req.body

    //Confirm data
    if(!id || !user || !title ||!text || typeof completed !== 'boolean'){
        return res.status(400).json({message:"All fields are required"})
    }

    const note = await Note.findById(id).exec()

    if(!note){
        return res.status(404).json({message:'Note not found'})
    }

     //Check for duplicate
     const duplicate = await Note.findOne({title}).collation({locale: 'en', strength:2}).lean().exec()
     //Allow renaming of the original note
     if(duplicate && duplicate?._id.toString() !== id){
         return res.status(404).json({message:'Duplicate note title'})
     }


     note.user = user
     note.title = title
     note.text = text
     note.completed = completed

     const updatedNote = await note.save() 

     res.json({message: `${updatedNote.title} updated`})
})

//@desc delete notes
//@route delete /notes
//@access Private
const deleteNotes = asyncHandler(async(req,res) =>{
    const {id} = req.body

    //confirm data
    if(!id){
        return res.status(400).json({message:'Note ID Required'})
    }

    //confirm note exists to delete
    const note = await Note.findById(id).exec()
    if(!note){
        return res.status(400).json({message: 'Notes not found'})
    }

    const result = await note.deleteOne()
    const reply = `Note ${result.title} with ID ${result._id} deleted`

    res.json(reply)
})

module.exports ={
    getNotes,
    createNewNotes,
    updateNotes,
    deleteNotes
}