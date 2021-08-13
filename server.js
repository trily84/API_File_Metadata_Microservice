var express = require('express')
var mongoose = require('mongoose')
MONGO_URI = "mongodb+srv://trily:aiai@cluster0.vvdsu.mongodb.net/Exercise_Tracker?retryWrites=true&w=majority"
mongoose.connect(MONGO_URI || "mongodb://localhost/trily")
mongoose.connection.on("connected", () => {
  console.log("Mongoose is connected")
})

var app = express()

const Schema = mongoose.Schema
const usernameSchema = new Schema({
  username: String,
  count: { type: Number },
  log: [
    {
      description: { type: String },
      duration: { type: Number },
      date: { type: String, required: false }
    }
  ]
})

const username = mongoose.model("username", usernameSchema)

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors')
app.use(cors({ optionsSuccessStatus: 200 })) // some legacy browsers choke on 204

// This is a body-parser that parse the body from post/fetch request EXCEPT from HTML post form
app.use(express.json())

app.use(express.static(__dirname + '/public'));

// This is a body parser for html post form
app.use(express.urlencoded({ extended: false }))

// app.use(express.static('public'))

app.get("/", function (req, res) {
  console.log("test GET method at / - working")
  res.sendFile(__dirname + '/public/index.html')
})

app.post('/api/users', async (req, res) => {

  console.log(req.body)
  let body_username = req.body.username
  console.log("username:", body_username)

  // create a model ready to save to mongoDB
  var username_model = new username({
    "username": body_username,
    "count": 0
  })

  // save to mongoDB database
  username_model.save(function (err, data) {
    if (err) return console.error(err);
    // done(null, data)
  })
  return res.json(username_model)
})

app.post('/api/users/:username_input/exercises', async (req, res) => {

  let username_input = req.body.username || req.params.username_input
  let query = { username: username_input }

  // var regex = new RegExp("(\d{4})\-(\d{2})\-(\d{4})")

  var regex = /^\d{4}[-]\d{2}[-]\d{2}$/
  dateST = req.body.date
  console.log(regex.test(dateST))

  if (regex.test(dateST)) {
    console.log("correct date format")
    date = new Date(dateST)
  }
  else {
    console.log("incorrect date format")
    date = new Date()
  }

  const exObj = { 
    description: req.body.description,
    duration: req.body.duration,
    date: date.toDateString()
  }

  username.findOneAndUpdate(query, { $inc: { count: 1 } , $push: { log: exObj } }, {new: true} , (err, result) => {
    if (err) return err
    console.log(result._id)
    console.log(result.username)
    console.log(exObj.description)
    console.log(exObj.duration)
    console.log(exObj.date)

    let duration = parseInt(exObj.duration);

    let resObj = {_id: result._id, username: result.username, date: exObj.date, duration: duration, description: exObj.description}    
    res.json(resObj)
  })

})

app.get("/api/users", function (req, res) {

  username.find({}, function (err, result) {
    if (err) throw err;
    if (result) {
      res.send(result)

    }
    else {
      res.send(JSON.stringify({
        error: 'Error'
      }))
    }
  })
})

app.get("/api/users/:_id/logs", function (req, res) {

  // console.log(req.params._id)
  // console.log(req.query.from)
  // console.log(req.query.to)
  // console.log(req.query.limit)

  let _id = req.params._id
  let from = req.query.from
  let to = req.query.to
  let limit = req.query.limit

  username.findOne({_id: req.params._id}, function (err, result) {
    if (err) res.send("invalid _id");
    if (result) {

      let log = result.log
      
      if (from) {
        const fromDate = new Date(from);
        log = log.filter(exe => new Date(exe.date) > fromDate) 
      }
      
      if (to) {
        const toDate = new Date(to);
        log = log.filter(exe => new Date(exe.date) < toDate)
      }
      
      if (limit) {
        log = log.slice(0, limit)
      }             


    let resObj = {_id: result._id, username: result.username, count: result.count, log: log}    
    res.json(resObj)
    // console.log(log)  
    
  }
  })
  
})

app.post("/api/users/:username_input", function (req, res) {

  // console.log(req.params._id)
  // console.log(req.query.from)
  // console.log(req.query.to)
  // console.log(req.query.limit)

  let username_input = req.body.username || req.params.username_input
  let from = req.body.from
  let to = req.body.to

  console.log(username_input)
  console.log(from)
  console.log(to)

  username.findOne({username: username_input}, function (err, result) {
    if (err) res.send("invalid username");
    if (result) {

      let log = result.log
      
      if (from) {
        const fromDate = new Date(from);
        log = log.filter(exe => new Date(exe.date) > fromDate) 
      }
      
      if (to) {
        const toDate = new Date(to);
        log = log.filter(exe => new Date(exe.date) < toDate)
      }         

    let resObj = {username: result.username, count: result.count, log: log}    
    res.json(resObj)
    
  }
  })
  
})

var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port)
})
