const fs = require('fs')
const express = require('express')
const app = module.exports = express()
const formidable = require('formidable')
const urlBuilder = require('lib/url-builder')
const config = require('../../../lib/config')
const buildUrl = require('../../utils/index')
const middlewares = require('../middlewares')

app.post('/upload',
 middlewares.users.restrict,
 middlewares.forums.findByName,
 function (req, res) {
  // if (!req.files)
  //   return res.status(400).send('No files were uploaded.')
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
     console.log(files)
    // const response = form.uploadDir + files.sampleFile.name + ' ' + 'uploaded Successufly'
    // return res.status(200).send(response)
     let options = {
       pathname: urlBuilder.for('admin.upload', {
         forum: req.forum.name
       })
     }
     console.log(req.forum)
     
     const url = buildUrl.buildUrl(config, options.pathname)
     return res.redirect(url)
   })
 })
