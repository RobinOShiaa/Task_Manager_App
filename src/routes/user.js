const express = require('express')
const User = require('../models/user')
const checkAuth = require('../middleware/checkAuth')
const router = new express.Router()
const multer = require('multer')
const sharp = require('sharp')
const {sendWelcome, sendCancellation} = require('../emails/profile.js')



router.post('/users/login', async (req,res) => {
  try {
    const user = await User.findByCredentials(req.body.email,req.body.password)
    const token = await user.generateAuthToken()
    res.send({user , token})
  } catch (e) {
    console.log(e)
    res.status(404).send()
  }
})

router.post('/users/logout',checkAuth, async (req,res) => {
    try {
      req.user.tokens = req.user.tokens.filter((token) => {
          return token.token !== req.token
      })

      await req.user.save()
      res.send()
    } catch(e) {
      res.status(500).send()
    }
})

router.post('/users/logoutAll',checkAuth,async (req,res) => {
  try {
    req.user.tokens = []
    await req.user.save()
    res.send()
  } catch(e) {
    res.status(500).send()

  }
})

router.post('/users', async (req, res) => {
  const user = new User(req.body)

  try {
      await user.save()
      sendWelcome(user.email, user.name)
      const token = await user.generateAuthToken()
      res.status(201).send({user, token})
  } catch (e) {
      res.status(400).send(e)
      console.log(e)
  }
})
  // user.save().then(() => {
  //   res.status(200).send(user)
  // }).catch((e) => {
  //   res.status(400).send(e)
  // })


const upload = multer({
    destination : (req, file, cb) => {
    cb(null, "./avatar")

    },

    filename: (req,file,cb) => {
      cb(null,Date.now() + "--" + file.originalname)
    },
  
    limits: {
        fileSize: 5000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
          return cb(new Error('Please upload jpg/jep/png file'))
        }

        cb(undefined, true)
    }
})




router.post('/users/me/avatar', checkAuth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer
    console.log(req.file.buffer)
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})


router.delete('/users/me/avatar',checkAuth, async(req,res) => {
  req.user.avatar = undefined
  await req.user.save()
  res.send()
})


router.get('/users/:id/avatar', async(req,res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user || !user.avatar) {
      throw new Error()
    }

    res.set('Content-Type','image/jpg')
    res.send(user.avatar)
  } catch(e) {
    res.status(404).send({error : 'error'})
  }
})


router.get('/users',checkAuth, async (req,res) => {
  try {
    const users = await User.find({})
    res.send(users)
  } catch(e) {
    res.status(500).send()
  }
  // User.find({}).then((users) => {
  //   res.send(users)
  // }).catch((e) => {
  //   res.status(500).send()
  // })
})



router.get('/users/me',checkAuth, async (req,res) => {
  res.send(req.user)
})

router.get('/users/:id', async (req,res) => {
  
  const _id = req.params.id
  try {
    const user = await User.findById(_id)

    if (!user) {
      return res.status(404).send()
    }
    res.send(user)
  } catch(e) {
    res.status(500).send(e)
  }
  // User.findById(_id).then((user) => {
  //   if (!user) {
  //     return res.status(404).send()
  //   }
  //   res.send(user)

  // }).catch((e) => {
  //     res.status(500).send(e)
  // })
})




router.patch('/users/me',checkAuth, async (req,res) => {

  const allowed = ['name','email','password','age']
  const updates = Object.keys(req.body)
  const isValid = updates.every((update) => allowed.includes(update))

  if (!isValid) {
    return res.status(400).send({error : 'Invalid updates'})
  }
  try {
      updates.forEach((update) => {
      req.user[update] = req.body[update]
    })

    await req.user.save()
    
    res.send(req.user)

  } catch(e) {
    console.log(e)
    res.status(400).send(e)
  }
})



router.delete('/users/me',checkAuth, async (req,res) => {
  // try {
  //   const user = await User.findByIdAndDelete(req.user._id)

  //   if (!user) {
  //     return res.status(404).send()
  //   }
    await req.user.remove()
    sendCancellation(req.user.email,req.user.name)
    res.send(req.user)

})




module.exports = router
