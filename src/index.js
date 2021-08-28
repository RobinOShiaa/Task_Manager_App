const app = require('./app')
const port = process.env.PORTNUMBER


app.listen(port, () => {
  console.log(`Server is up on port ${port}`)
})



