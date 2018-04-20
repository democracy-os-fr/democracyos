const fs = require('fs')

const express = require('express')
const app = module.exports = express()
var formidable = require('formidable')

app.post('/upload.jpg', function (req, res) {
  // if (!req.files)
  //   return res.status(400).send('No files were uploaded.')
  var form = new formidable.IncomingForm()
  form.uploadDir = '/home/marouen/Documents/agoradev/democracyos-alt-agora-dev/public/uploads/'
  form.maxFields = 1
  form.multiples = false
  form.on('file', function (field, file) {
    //  rename the incoming file to the file's name
    fs.rename(file.path, form.uploadDir + '/' + file.name)
  })

  form.on('error', function (err) {
    console.log('an error has occured with form upload')
    console.log(err)
    req.resume()
  })
  form.on('aborted', function () {
    console.log('user aborted upload')
  })
  form.on('end', function () {
    console.log('-> upload done')
  })

  form.parse(req, function (err, fields, files) {
    if (err) {
      res.write(err)
    }
    res.writeHead(200, { 'content-type': 'text/plain' })
    res.write('received upload:\n\n')
    res.write('fileUploaded successfully')
  })
})
