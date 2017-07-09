var express = require('express')
var log = require('debug')('democracyos:user')
var utils = require('lib/utils')
var accepts = require('lib/accepts')
var restrict = utils.restrict
var staff = utils.staff
var pluck = utils.pluck
var api = require('lib/db-api')

var setDefaultForum = require('lib/middlewares/forum-middlewares').setDefaultForum
var initPrivileges = require('lib/middlewares/user').initPrivileges
var canCreate = require('lib/middlewares/user').canCreate
var canManage = require('lib/middlewares/user').canManage

var app = module.exports = express()

/**
 * Limit request to json format only
 */

app.use(accepts('application/json'))

app.get('/user/all', restrict, function (req, res) {
  log('Request /user/all')
  api.user.all(function (err, users) {
    if (err) return _handleError(err, req, res)

    log('Serving all users')
    res.json(users.map(api.user.expose.ordinary))
  })
})

app.get('/user/me', restrict, initPrivileges, canCreate, setDefaultForum, canManage, function (req, res) {
  log('Request user/me')

  log('Serving user %j', req.user.id)
  res.json(api.user.expose.confidential(req.user))
})

app.get('/user/search', restrict, function (req, res) {
  var q = req.param('q')

  log('Request user/search %j', q)

  api.user.search(q, function (err, users) {
    if (err) return _handleError(err, req, res)

    log('Serving users %j', pluck(users, 'id'))
    res.json(users.map(api.user.expose.ordinary))
  })
})

app.get('/user/:id', restrict, function (req, res) {
  log('Request user/%s', req.params.id)

  api.user.get(req.params.id, function (err, user) {
    if (err) return _handleError(err, req, res)

    log('Serving user %j', user.id)
    res.json(api.user.expose.ordinary(user))
  })
})

app.post('/user/generate', staff, function (req, res, next) {
  log('Request /user/generate')
  let body = {

  }
  api.user.create(body, function (err, user) {
    if (err) return _handleError(err, req, res)
    res.json(api.user.expose.ordinary(user))
  })
})

app.post('/user/create', staff, function (req, res, next) {
  log('Request /user/create %j', req.body.user)

  api.user.create(req.body, function (err, user) {
    if (err) return _handleError(err, req, res)
    res.json(api.user.expose.ordinary(user))
  })
})

function _handleError (err, req, res) {
  res.format({
    html: function () {
      // this should be handled better!
      // maybe with flash or even an
      // error page.
      log('Error found with html request %j', err)
      res.redirect('back')
    },
    json: function () {
      log('Error found: %j', err)
      res.json({ error: err })
    }
  })
}
