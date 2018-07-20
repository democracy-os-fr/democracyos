const fs = require('fs')
const path = require('path')
const express = require('express')
const app = module.exports = express()
const contains = require('mout/array/contains')
const config = require('../../../lib/config')
const buildUrl = require('../../utils/index')
  // const validate = require('../validate')
const middlewares = require('../middlewares')

app.get('/upload.files',
// validate({
//   query: Object.assign({}, validate.schemas.pagination, {
//     topicId: {
//       type: 'string',
//       required: true,
//       format: 'mongo-object-id',
//       description: 'id of the Topic to fetch comments from'
//     },
//     sort: {
//       type: 'string',
//       enum: ['score', '-score', 'createdAt', '-createdAt', 'random'],
//       default: '-score'
//     }
//   })
// }),
// middlewares.users.staff,
function (req, res, next) {
  fs.readdir(config.uploader.path, function (err, files, fileState) {
    if (err) {
      console.error(err)
      return next()
    }

    let images = []
    let documents = []
    let stats = []

    for (let i = 0; i < files.length; i++) {
      console.dir(files[i])
      if (contains(config.upload.images, path.extname(files[i]))) {
        images.push(files[i])
      } else if (contains(config.upload.documents, path.extname(files[i]))) {
        documents.push(files[i])
      }
      stats.push(fs.statSync(config.uploader.path + files[i]))
      console.log('fileState' + i + JSON.stringify(stats[i]))
    }
    return res.status(200).json({
      status: 200,
      images,
      documents,
      stats,
      route: buildUrl.buildUrl(config, config.uploader.route),
      pagination: {
        count: documents.length,
        page: req.query.page,
        pageCount: Math.ceil(documents.length / req.query.limit) || 1,
        limit: req.query.limit
      }
    })
  })
})
