const mongoose = require('mongoose')

const Schema = new mongoose.Schema({
  description : {
    type : String,
    required : true,
    trim : true
  },

  completed : {
    type : Boolean,
    default : false
  },

   author : {
    type : mongoose.Schema.Types.ObjectId,
    required : true,
    ref : 'User'

  } 
},
{timestamps : true})
const Task = mongoose.model('Task', Schema)

module.exports = Task