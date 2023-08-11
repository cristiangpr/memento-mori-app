const express = require('express')
const path = require('path')
const cors = require('cors')

const app = express()
const port = process.env.PORT || 3000
app.use(express.json())

app.use('/manifest.json', function (req, res, next) {
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
  })

  next()
})

// Your static pre-build assets folder
app.use(express.static(path.join(__dirname, '..', 'build')))
// Root Redirects to the pre-build assets

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '..', 'build'))
})
// Any Page Redirects to the pre-build assets folder index.html that // will load the react app
app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, '..', 'build/index.html'))
})
app.listen(port, () => {
  console.log('Server is running on port: ', port)
})
