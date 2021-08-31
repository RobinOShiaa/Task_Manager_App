const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const testUserId = new mongoose.Types.ObjectId()
const testUser = {
  _id : testUserId,
  name : 'Test Robin',
  email : 'Test@gmail.com',
  password : '12345678',
  tokens : [{
    token : jwt.sign({_id : testUserId}, process.env.JWT_SECRET)
  }]
}

const DbSetup = async () => {
  await User.deleteMany(_)
  await new User(testUser).save()
}


module.exports = {
  testUserId,
  testUser,
  DbSetup
}