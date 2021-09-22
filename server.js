var express = require('express')

var app = express()
app.use(express.json());

const multer  = require('multer')
const upload = multer({ dest: './public/data/uploads/' })

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

app.post('/api/fileanalyse', upload.single('upfile'), function (req, res) {
   // req.file is the name of your file in the form above, here 'upfile'
   // req.body will hold the text fields, if there were any 
   // console.log("req.file", req.file, "req.body:", req.body)

   res.json({
     name: req.file.originalname,
     type: req.file.mimetype,
     size: req.file.size
   })
})

var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port)
})
