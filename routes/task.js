const express = require('express')
const Task = require('../models/task')
const router = new express.Router()
const checkAuth = require('../middleware/checkAuth')



router.post('/tasks',checkAuth, async (req,res) => {
  // const task = new Task(req.body)
  const task = new Task({
    ...req.body,
    author: req.user._id
  })
  const identity = req.user._id
  console.log({task,identity})
  try {
    await task.save()
    res.status(201).send(task)
  } catch(e) {
    res.status(400).send(e)
  }
  // task.save().then(() => {
  //   res.status(201).send(task)
  // }).catch((e) => {
  //   res.status(400).send(e)
  // })
})




// GET /tasks?completed=false
// GET /tasks?limit=10&skip=20
// GET /tasks?sortBy=createdAt-desc

router.get('/tasks',checkAuth, async (req,res) => {
  const match = {}
  const sort = {}
  
  if (req.query.completed) {
    match.completed = req.query.completed === 'true'
  }

  if (req.query.sortBy) {
    const keys = req.query.sortBy.split('-')
    sort[keys[0]] = keys[1] === 'desc' ? -1 : 1
  }
  try {
    await req.user.populate({
      path : 'tasks',
      match,
      options : {
        limit : parseInt(req.query.limit),
        skip : parseInt(req.query.skip),
        sort
      }
    }).execPopulate()
    // const tasks = await Task.find({author: req.user._id})
    // await req.user.populate('tasks').execPopulate()
    res.send(req.user.tasks)
  } catch(e) {
    res.status(500).send(e)
  }
  // Task.find({}).then((task) => {
  //   res.send(task)
  // }).catch((e) => {
  //   res.status(500).send(e)
  // })
})


router.get('/tasks/:id',checkAuth, async (req,res) => {
  const _id = req.params.id
  try {
    const task = await Task.findOne({_id,author:req.user._id})
    // const task = await Task.findById(_id)
    console.log(task)

    if (!task) {
      return res.status(404).send()
    }

    res.send(task)
  } catch(e) {
    console.log(e)
    res.status(500).send(e)
  }
  // Task.findById(_id).then((task) => {

  //   if (!task) {
  //     return res.status(404).send()
  //   }
  //   res.send(task)
  // }).catch((e) => {
  //   res.status(500).send()
  // })
})




router.patch('/tasks/:id', checkAuth,async (req,res) => {
  const updates = Object.keys(req.body)
  const allowed = ['description','completed']
  const isValid = updates.every((update) => allowed.includes(update))
  
  if (!isValid) {
    return res.status(400).send({error : 'Invalid updates'})
  }

  try {
    // const task = await Task.findByIdAndUpdate(req.params.id,req.body,{new : true, runValidators : true})
    // const task = await Task.findById(req.params.id)
    const task = await Task.findOne({_id: req.params.id, author:req.user._id})

    console.log(task)
    

    if (!task) {
      return res.status(404).send()
    }
    updates.forEach((update) => {
      task[update] = req.body[update]
      })
    await task.save()

    res.send(task)
  } catch(e) {
    console.log(e)
    res.status(400).send(e)
  }
})




router.delete('/tasks/:id',checkAuth, async (req,res) => {
  try {
    // const task = await Task.findByIdAndDelete(req.params.id)
    const task = await Task.findOneAndDelete({_id: req.params.id, author:req.user._id})

    if (!task) {
      return res.status(404).send()
    }

    res.send(task)

  } catch (e) {
    res.status(500).send(e)

  }
})

module.exports = router
