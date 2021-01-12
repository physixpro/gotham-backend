const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const app = express()
const ObjectID = require('mongodb').ObjectID
app.use(express.json())
app.use(cors())
app.use(express.urlencoded({extended:true}))

mongoose.connect('mongodb+srv://data:1234@cluster0.qvhok.mongodb.net/gotham?retryWrites=true&w=majority', {useUnifiedTopology:true,useNewUrlParser:true})
const db = mongoose.connection

db.on('error', console.error.bind(console, 'connection error'))
db.once('open', function callback () {
    console.log('Database is up and running')
})

app.get('/evaluations', async (req,res) => {
    const evaluations = await db.collection('evaluations').find({}).toArray()
    res.json(evaluations)
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