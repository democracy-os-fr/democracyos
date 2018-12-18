const fs = require('fs')
const express = require('express')
const app = module.exports = express()
const formidable = require('formidable')
const utils = require('lib/utils')
const config = require('lib/config')
const middlewares = require('../middlewares')

app.post('/upload', middlewares.users.restrict, function (req, res, next) {
  // if (!req.files)
  //   return res.status(400).send('No files were uploaded.')
  var form = new formidable.IncomingForm()
  form.uploadDir = config.uploader.path
  form.maxFields = 1
  form.multiples = false
  form.on('file', function (field, file) {
    //  rename the incoming file to the file's name
    console.log('on file')
    fs.rename(file.path, form.uploadDir + '/' + file.name, (error) => {
      console.log('fs.rename callback')
      if (error) {
        console.error(error)
        return next(error)
      }
    })
  })

  form.on('error', function (err) {
    console.log('an error has occured with form upload')
    console.error(err)
    req.resume()
  })
  form.on('aborted', function () {
    console.log('user aborted upload')
  })
  form.on('end', function () {
    console.log('-> upload done')
  })

  form.parse(req, function (error, fields, files) {
    console.log('parse')
    if (error) {
      console.error(error)
      return res.status(error.status || 500).send(error.message || 'UPLOAD_ERROR')
    } else {
      console.dir(fields)

      if (files[0]) {
        console.dir(files[0])
        let url = utils.buildUrl(config, { pathname: '/uploads/' })
        console.dir(url)
        return res.status(200).send(files[0].name)
      } else {
        return res.status(200).send('UPLOAD_FILE_EMPTY')
      }
    }
  })
})
