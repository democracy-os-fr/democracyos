const fs = require('fs')
const express = require('express')
const app = module.exports = express()
const config = require('../../../lib/config')
const buildUrl = require('../../utils/index')
app.get('/upload.files', function (req, res) {
  fs.readdir(config.upload.dir, function (err, files) {
    if (err) {
      console.log(err)
    }
    for (let i = 0; i < files.length; i++) {
      console.log(files[i])
    }
    let options = {
      pathname: '/uploads/'
    }
    res.url = buildUrl.buildUrl(config, options.pathname)
    console.log(res.url)
    return res.status(200).json({
      status: 200,
      files: files,
      url: res.url
    })
  })
})
