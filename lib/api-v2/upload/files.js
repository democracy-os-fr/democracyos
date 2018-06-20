const fs = require('fs')
var path = require('path')
const express = require('express')
const app = module.exports = express()
const config = require('../../../lib/config')
const buildUrl = require('../../utils/index')
app.get('/upload.files', function (req, res) {
  fs.readdir(config.upload.dir, function (err, files, fileState) {
    if (err) {
      console.log(err)
    }
    let options = {
      pathname: '/uploads/'
    }
    let images = []
    let txtFiles = []
    res.url = buildUrl.buildUrl(config, options.pathname)
    fileState = []
    for (let i = 0; i < files.length; i++) {
      switch (path.extname(files[i])) {
        case '.png':
          images.push(files[i])
          break
        case '.jpg':
          images.push(files[i])
          break
        case '.jpeg':
          images.push(files[i])
          break
        case '.pdf':
          txtFiles.push(files[i])
          break
        case '.txt':
          txtFiles.push(files[i])
          break
        case '.doc':
          txtFiles.push(files[i])
          break
        case '.ppt':
          txtFiles.push(files[i])
          break
        case '.odt':
          txtFiles.push(files[i])
          break
      }
      fileState[i] = fs.statSync(config.upload.dir + files[i])
      console.log('fileState' + i + JSON.stringify(fileState[i]))
    }
    return res.status(200).json({
      status: 200,
      _images: images,
      files: txtFiles,
      url: res.url,
      filesDates: fileState
    })
  })
})
