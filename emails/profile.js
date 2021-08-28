const sgMail = require('@sendgrid/mail')



sgMail.setApiKey(process.env.SENDKEY)

sgMail.send({
  to : 'oshea.robinho@gmail.com',
  from : 'oshea.robinho@gmail.com',
  subject : 'This is my first creation!',
  text : 'I hope this works'
})


const sendWelcome = (email, name) => {
  sgMail.send({
    to : email,
    from : 'oshea.robinho@gmail.com',
    subject : 'Created Account',
    text : `Hello ${name}. Welcome to my application`
  })
}

const sendCancellation = (email,name) => {
  sgMail.send({
    to : email,
    from : 'oshea.robinho@gmail.com',
    subject : 'Thank you for using my application',
    text : `Goodbye ${name}, I hope you return to my application`
  })
}

module.exports = {
  sendWelcome,
  sendCancellation
}