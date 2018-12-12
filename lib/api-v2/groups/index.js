const express = require('express')
const validate = require('../validate')
const middlewares = require('../middlewares')
const api = require('../db-api')

const app = module.exports = express.Router()

app.get('/groups',
validate({
  query: Object.assign({}, validate.schemas.pagination)
}),
// middlewares.forums.privileges.canView,
function getGroups (req, res, next) {
  Promise.all([
    api.groups.list({
      user: req.user,
      limit: req.query.limit,
      page: req.query.page
    }),
    api.groups.listCount(req.query)
  ]).then((results) => {
    res.status(200).json({
      pagination: {
        count: results[1],
        page: req.query.page,
        pageCount: Math.ceil(results[1] / req.query.limit) || 1,
        limit: req.query.limit
      },
      groups: results[0]
    })
  }).catch(next)
})

app.get('/group/:id',
  middlewares.groups.findById,
  function getGroup (req, res, next) {
    if (req.group) {
      res.status(200).json({
        group: req.group
      })
    } else {
      res.status(404).json({ id: req.id })
    }
  }
)

app.post('/groups',
middlewares.users.restrict,
validate({ filter: true }),
middlewares.groups.privileges.canCreate,
function createGroups (req, res, next) {
  api.groups.create({
    user: req.user,
    name: req.body.name,
    description: req.body.description,
    logoUrl: req.body.logoUrl,
    justificatoryUrl: req.body.justificatoryUrl,
    users: req.body.users,
    owners: req.body.owners
  }).then((group) => {
    req.group = group
    next()
  }).catch(next)
},
function (req, res) {
  res.json({
    group: req.group
  })
})

app.delete('/groups/:id',
middlewares.users.restrict,
middlewares.groups.findById,
middlewares.groups.privileges.canManage,
function delGroup (req, res, next) {
  api.groups.removeGroup({
    user: req.user,
    id: req.params.id
  }).then(() => {
    res.status(200).json({})
  }).catch(next)
})

app.put('/groups/:id',
middlewares.users.restrict,
middlewares.groups.findById,
middlewares.groups.privileges.canEdit,
function editGroups (req, res, next) {
  api.groups.edit({
    id: req.params.id,
    user: req.user,
    name: req.body.name,
    description: req.body.description,
    logoUrl: req.body.logoUrl,
    justificatoryUrl: req.body.justificatoryUrl,
    users: req.body.users,
    owners: req.body.owners
  }).then((group) => {
    res.status(200).json({
      group: group,
      messages: ['group.creation.message.onsuccess']
    })
  }).catch(next)
})
