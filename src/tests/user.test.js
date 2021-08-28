const request = require('supertest')
const app = require('../app')

test('Create new user' , async () => {
  await request(app).post('/users').send({
    name : 'Test Robin',
    email : "Test@example.com",
    password : '123456789'
  }).expect(201)

})