const User = require('../models/User')
const Note = require('../models/Note')
const asyncHandler = require('express-async-handler')//use it to reduce try and catch blocks
const bcrypt = require('bcrypt')//to encrypt password

//@desc Get all users
//@route GET /users
//@access Private
const getAllUsers = asyncHandler(async(req, res) =>{
    const users = await User.find().select('-password').lean()//you only add lean if the data won't be saved
    if(!users?.length){
        return res.status(400).json({message: 'No users found'})
    }
    res.json(users)
})
//@desc Create new user
//@route POST /users
//@access Private
const createNewUser = asyncHandler(async(req, res) =>{
    const {username, password, roles} =req.body

    //Confirm data
    if(!username || !password ){
        return res.status(400).json({message:"All fields are required"})
    }

    //Check DUPLICATE //you add the exec function when using await(mongoose)
    const duplicate = await User.findOne({username}).collation({locale: 'en', strength:2}).lean().exec()

    if(duplicate){
        return res.status(400).json({message:'Duplicate username'})
    }

    //Hash password
    const hashedpwd = await bcrypt.hash(password, 8)

    const userObject =(!Array.isArray(roles) || !roles.length) ? {username, "password":hashedpwd} : {username, "password":hashedpwd, roles}

    //Create and store new user
    const user = await User.create(userObject)

    if(user){
        res.status(201).json({message:`New user ${username} created`})
    }
    else{
        res.status(400).json({message:`Invalid user data recieved`})
    }
})
//@desc Update a user
//@route PATCH /users
//@access Private
const updateUser = asyncHandler(async(req, res) =>{
    const {id, active, username, password, roles } =req.body

    //Confirm data
    if(!id || !username || !Array.isArray(roles)|| !roles.length || typeof active !== 'boolean'){
        return res.status(400).json({message:"All fields are required"})
    }

    const user = await User.findById(id).exec()

    if(!user){
        return res.status(404).json({message:'User not found'})
    }

    //Check for duplicate
    const duplicate = await User.findOne({username}).collation({locale: 'en', strength:2}).lean().exec()
    //Allow duplicates to the original user
    if(duplicate && duplicate?._id.toString() !== id){
        return res.status(404).json({message:'Duplicate username'})
    }

    user.username = username
    user.roles = roles
    user.active = active

    if(password){
        //hash password
        user.password = await bcrypt.hash(password, 8)
    }

    const updateUser = await user.save()

    res.json({message: `${updateUser.username} updated`})
})
//@desc Delete a user
//@route DELETE /users
//@access Private
const deleteUser = asyncHandler(async(req, res) =>{
    const {id} = req.body

    //confirm data
    if(!id){
        return res.status(400).json({message:'User ID Required'})
    }

    const note = await Note.findOne({user: id}).lean().exec()
    if(note){
        return res.status(400).json({message: 'User has assigned notes'})
    }

    const user = await User.findById(id).exec()

    if(!user){
        return res.status(400).json({message:'User not found'})
    }

    const result = await user.deleteOne()
    const reply = `Username ${result.username} with ID ${result._id} deleted`

    res.json(reply)
})

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}