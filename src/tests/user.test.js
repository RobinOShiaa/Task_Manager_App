const request = require('supertest')
const app = require('../app')
const User = require('../models/user')


const userOne = {
  name : 'Test Robin',
  email : 'Test@gmail.com',
  password : '123456789'
}

beforeEach(async () => {
  await User.deleteMany()
  await new User(userOne).save()
})

// afterEach(() => {
//   console.log('afterEach')
// })

test('Create new user' , async () => {
  await request(app).post('/users').send({
    name : 'Test Robin',
    email : "Test@example.com",
    password : '123456789'
  }).expect(201)

})


test('Login', async () => {
  await request(app).post('/users/login').send({
    email : userOne.email,
    password : userOne.password
  }).expect(200)
})


test('Login failure', async () => {
  await request(app).post('/users/login').send({
    email : userOne.email,
    password : '2527234637'
  }).expect(400)
})