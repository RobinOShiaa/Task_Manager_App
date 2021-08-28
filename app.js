const express = require('express') 
require('./db/mongoose')
const User = require('./models/user')
const Task = require('./models/task')
const router1 = require('./routes/user')
const router2 = require('./routes/task')
const bcrypt = require('bcryptjs')



const app = express()
app.use(express.json())
app.use(router1)
app.use(router2)





module.exports = app


