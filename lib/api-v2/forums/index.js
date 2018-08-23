const express = require('express')
const middlewares = require('../middlewares')
const api = require('../db-api')

const app = module.exports = express()

app.get('/forums/:id/tags',
  middlewares.forums.findById,
  middlewares.forums.findTags,
  function tags (req, res, next) {
    return res.status(200).json({
      status: 200,
      results: {
        tags: req.tags
      }
    })
  }
)

app.put('/forums/:id',
  middlewares.forums.findById,
  middlewares.forums.parseUpdateableKeys,
  function edit (req, res, next) {
    api.forums
      .edit({ _id: req.params.id }, req.keysToUpdate)
      .then((forum) => {
        res.status(200).json({
          status: 200,
          results: {
            forum: forum
          }
        })
      })
      .catch(next)
  }
)
app.post('/forums/:id/publish',
  middlewares.users.restrict,
  middlewares.forums.findById,
  function publishForum (req, res, next) {
    api.forums.publish({
      id: req.params.id
    }).then((forum) => {
      res.status(200).json({
        status: 200,
        results: {
          forum: forum
        }
      })
    }).catch(next)
  })

app.post('/forums/:id/unpublish',
  middlewares.users.restrict,
  middlewares.forums.findById,
  function unpublishForum (req, res, next) {
    api.forums.unpublish({
      id: req.params.id
    }).then((forum) => {
      res.status(200).json({
        status: 200,
        results: {
          forum: forum
        }
      })
    }).catch(next)
  }
)

app.put('/forums/:id',
middlewares.forums.findById,
middlewares.forums.parseUpdateableKeys,
function edit (req, res, next) {
  api.forums
    .edit({ _id: req.params.id }, req.keysToUpdate)
    .then((forum) => {
      res.status(200).json({
        status: 200,
        results: {
          forum: forum
        }
      })
    })
    .catch(next)
})
