const fs = require('fs')
const path = require('path')
const express = require('express')
const app = module.exports = express()
const config = require('../../../lib/config')
const urlBuilder = require('../../url-builder')
const middlewares = require('../middlewares')

app.delete('/file', middlewares.users.restrict, function (req, res) {
  fs.readdir(config.uploader.path, function (err, files) {
    if (err) {
      console.log(err)
    }
    fs.unlink(config.uploader.path + '/' + req.body.filetodelete, (err) => {
      if (err) {
        throw err
      }
      console.log('fileDeleted')
    })
    const url = urlBuilder.for('system.upload')
    return res.redirect(url)
  })
})

app.delete('/files', middlewares.users.staff, function (req, res) {
  fs.readdir(config.uploader.path, function (err, files, fileState) {
    if (err) {
      console.log(err)
    }
    fileState = []
    for (let i = 0; i < files.length; i++) {
      fileState[i] = fs.statSync(config.uploader.path + files[i])
      switch (path.extname(files[i])) {
        // Documents
        case '.pdf':
          fs.unlinkSync(config.uploader.path + '/' + files[i])
          break
        case '.txt':
          fs.unlinkSync(config.uploader.path + '/' + files[i])
          break
        case '.doc':
          fs.unlinkSync(config.uploader.path + '/' + files[i])
          break
        case '.odt':
          fs.unlinkSync(config.uploader.path + '/' + files[i])
          break
        case '.ppt':
          fs.unlinkSync(config.uploader.path + '/' + files[i])
          break
        // Images
        case '.png':
          fs.unlinkSync(config.uploader.path + '/' + files[i])
          break
        case '.jpg':
          fs.unlinkSync(config.uploader.path + '/' + files[i])
          break
        case '.jpeg':
          fs.unlinkSync(config.uploader.path + '/' + files[i])
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
