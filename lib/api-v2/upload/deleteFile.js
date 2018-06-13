const fs = require('fs')
const express = require('express')
const app = module.exports = express()
const config = require('../../../lib/config')
const urlBuilder = require('../../url-builder/index')
const middlewares = require('../middlewares')
app.post('/upload.deleteFile', middlewares.users.restrict, function (req, res) {
  fs.readdir(config.upload.dir, function (err, files) {
    if (err) {
      console.log(err)
    }
    fs.unlink(config.upload.dir + '/' + req.body.imagetodelete, (err) => {
      if (err) {
        throw err
      }
      console.log('fileDeleted')
    })
    const url = urlBuilder.for('system.upload')
    return res.redirect(url)
  })
})
