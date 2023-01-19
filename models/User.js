const mongoose = require('mongoose')

//data model(we need to think about differen types of data that the users collection needs to store)
const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    roles:{
        //even if the role of a user is not assigned it will be assigned to the default employee
        type:[String],
        default:["Employee"]
    },
    active:{
        type:Boolean,
        default:true
    }
})

module.exports = mongoose.model("User", userSchema)
