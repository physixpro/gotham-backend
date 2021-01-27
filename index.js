require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const app = express()
const ObjectID = require('mongodb').ObjectID
app.use(express.json())
app.use(cors())
app.use(express.urlencoded({extended:true}))

mongoose.connect( process.env.MONGODB_URI, {useUnifiedTopology:true,useNewUrlParser:true})
const db = mongoose.connection

db.on('error', console.error.bind(console, 'connection error'))
db.once('open', function callback () {
    console.log('Database is up and running')
})

app.put('/evaluation/:id', async(req,res) => {
    const id = req.params.id
    const body = req.body
    const x = await db.collection('evaluations').updateOne({_id: new ObjectID(id)}, {$set: {name:body.name, email:body.email}})
    res.json(x)
})

app.get('/evaluations', async (req,res) => {
    const evaluations = await db.collection('evaluations').find({}).toArray()
    res.json(evaluations)
})

app.get('/evaluation/:id', async(req,res) => {
    const id = req.params.id
    const user = await db.collection('evaluations').find({_id:new ObjectID(id)}).toArray()
    res.json(user)
})

app.delete('/evaluation/:id', async (req,res) => {
    const id = req.params.id
    const x = await db.collection('evaluations').deleteOne({_id:new ObjectID(id)})
    res.json("User deleted")
})

app.get('/', async (req,res) => {
res.json("Hello World")
})

app.post('/user_info', async (req, res) => {
   const form = req.body
   const x = await db.collection('user_info').insertOne(form)
   console.log(form)
   res.json('user added successfully')
})

app.post('/evaluations', async(req,res) => {
    const athleteResult = req.body
    const x = await db.collection('evaluations').insertOne(athleteResult)
    console.log(athleteResult)
    res.json('evaluated successfully')
})

const port = process.env.PORT || 3001
app.listen(port, () => console.log(`Server is running on port ${port}...`))


