const fs = require('fs')
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
    res.url = buildUrl.buildUrl(config, options.pathname)
    fileState = []
    for (let i = 0; i < files.length; i++) {
      fileState[i] = fs.statSync(config.upload.dir + files[i])
      console.log('fileState' + i + JSON.stringify(fileState[i]))
    }
    return res.status(200).json({
      status: 200,
      files: files,
      url: res.url,
      filesDates: fileState
    })
  })
})
