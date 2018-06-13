const fs = require('fs')
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
      console.log(fileState[i])
      console.log('deleting images')
      fs.unlinkSync(config.upload.dir + '/' + files[i])
      console.log('images deleted!')
    }
    return res.status(200).json({
      status: 200,
      files: files,
      url: res.url,
      filesDates: fileState
    })
  })
})
