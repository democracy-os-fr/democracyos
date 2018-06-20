const fs = require('fs')
var path = require('path')
const express = require('express')
const app = module.exports = express()
const config = require('../../../lib/config')
const middlewares = require('../middlewares')

app.post('/upload.deleteFiles', middlewares.users.restrict, function (req, res) {
  fs.readdir(config.upload.dir, function (err, files, fileState) {
    if (err) {
      console.log(err)
    }
    fileState = []
    for (let i = 0; i < files.length; i++) {
      fileState[i] = fs.statSync(config.upload.dir + files[i])
      switch (path.extname(files[i])) {
        case '.pdf':
          fs.unlinkSync(config.upload.dir + '/' + files[i])
          break
        case '.txt':
          fs.unlinkSync(config.upload.dir + '/' + files[i])
          break
        case '.doc':
          fs.unlinkSync(config.upload.dir + '/' + files[i])
          break
        case '.odt':
          fs.unlinkSync(config.upload.dir + '/' + files[i])
          break
        case '.ppt':
          fs.unlinkSync(config.upload.dir + '/' + files[i])
          break
      }
      console.log('files deleted!')
    }
    return res.status(200).json({
      status: 200,
      files: files,
      url: res.url,
      filesDates: fileState
    })
  })
})
app.post('/upload.deleteImages', middlewares.users.restrict, function (req, res) {
  fs.readdir(config.upload.dir, function (err, files, fileState) {
    if (err) {
      console.log(err)
    }
    fileState = []
    for (let i = 0; i < files.length; i++) {
      fileState[i] = fs.statSync(config.upload.dir + files[i])
      switch (path.extname(files[i])) {
        case '.png':
          fs.unlinkSync(config.upload.dir + '/' + files[i])
          break
        case '.jpg':
          fs.unlinkSync(config.upload.dir + '/' + files[i])
          break
        case '.jpeg':
          fs.unlinkSync(config.upload.dir + '/' + files[i])
          break
      }
    }
    console.log('images deleted!')
    return res.status(200).json({
      status: 200,
      files: files,
      url: res.url,
      filesDates: fileState
    })
  })
})
