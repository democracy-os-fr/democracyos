const fs = require('fs')

const express = require('express')
const app = module.exports = express()
const formidable = require('formidable')
const config = require('lib/config')

app.post('/upload', function (req, res) {
  // if (!req.files)
  //   return res.status(400).send('No files were uploaded.')

  if (config.upload.dir === '') {
    return res.status(400).send('Upload directory need to be set.')
  }

  var form = new formidable.IncomingForm()
  form.uploadDir = config.upload.dir
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
    return res.status(200).send('File uploaded successfully')
  })
})
