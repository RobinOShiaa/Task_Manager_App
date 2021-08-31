const request = require('supertest')
const app = require('../app')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const User = require('../models/user')

const userId = new mongoose.Types.ObjectId()

const testUser = {
  _id : userId,
  name : 'Test Robin',
  email : 'Test@gmail.com',
  password : '123456789',
  tokens : [{
    token : jwt.sign({_id : userId}, process.env.JWT_SECRET)
  }]
}

beforeEach(async () => {
  await User.deleteMany()
  await new User(testUser).save()
})

// afterEach(() => {
//   console.log('afterEach')
// })

test('Create new user' , async () => {
  const response = await request(app).post('/users').send({
    name : 'Test Robin',
    email : "Test@example.com",
    password : '123456789'
  }).expect(201)
  const user = await User.findById(response.body.user._id)
  expect(user).not.toBeNull()

  expect(response.body.user.name).toBe('Test Robin')
  expect(response.body).toMatchObject({
    user : {
      name : 'Test Robin',
      email : 'Test@example.com'
    }
  })
})


test('Login', async () => {
  const response = await request(app).post('/users/login').send({
    email : testUser.email,
    password : testUser.password
  }).expect(200)

  const user = await User.findById(userId)
  expect(response.body.token).toBe(user.tokens[1].token)
})


test('Login failure', async () => {
  await request(app).post('/users/login').send({
    email : testUser.email,
    password : '2527234637'
  }).expect(400)
})


test('fetch profile of user', async () => {
  await request(app)
  .get('/users/me')
  .set('Authorization', `Bearer ${userId.tokens[0].token}`)
  .send()
  .expect(200)
})


test('Fetch Profile Failure', async () => {
  await request(app)
  .get('/users/me')
  .send()
  .expect(401)
})


test('Delete users account', async () => {
  const response = await request(app)
  .delete('/users/me')
  .set('Authorization', `Bearer ${userId.tokens[0].token})`)
  .send()
  .expect(200)
  const user = User.findById(userId)
  expect(user).toBeNull()
})


test('Fail to Delete account', async () => {
  await request(app)
  .delete('/users/me')
  .send()
  .expect(401)
})

test('Upload Profile Picture', async () => {
  await request(app)
    .post('/users/me/avatar')
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .attach('avatar', 'tests/images/sample.jpg')
    .expect(200)
  const user = await User.findById(userId)
  expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Update user fields', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .send({
      name : 'Simon'
    })
    .expect(200)
  const user = await User.findById(userId)
  expect(user.name).toEqual('Simon')
})


test('Fail update user fields', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .send({
      Country : 'Simon'
    })
    .expect(400)
})