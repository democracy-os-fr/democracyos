/**
 * Module dependencies.
 */

var express = require('express')
var Batch = require('batch')
var log = require('debug')('democracyos:whitelist-api')
var isEmpty = require('mout/lang/isEmpty')
var flatten = require('mout/array/flatten')
var unique = require('mout/array/unique')
var api = require('lib/db-api')
var config = require('lib/config')
var utils = require('lib/utils')
var accepts = require('lib/accepts')
var staff = utils.staff
var pluck = utils.pluck

function _handleError (err, req, res) {
  log('Error found: %s', err)
  var error = err
  if (err.errors && err.errors.text) error = err.errors.text
  if (error.type) error = error.type

  res.status(400).json({ error: error })
}

var app = module.exports = express()

if (config.usersWhitelist) {
  /**
   * Limit request to json format only
   */

  app.use(accepts('application/json'))

  app.get('/whitelists/all', staff, function (req, res) {
    log('Request /whitelists/all')

    api.whitelist.all(function (err, whitelists) {
      if (err) return _handleError(err, req, res)

      log('Serving whitelist %j', pluck(whitelists, 'id'))

      res.status(200).json(whitelists)
    })
  })

  app.get('/whitelists/:forum/all', staff, function (req, res) {
    log('Request /whitelists/all')

    api.whitelist.find({
      forum: req.params.forum
    }, function (err, whitelists) {
      if (err) return _handleError(err, req, res)

      log('Serving whitelist for forum %s %j', req.params.forum, pluck(whitelists, 'id'))

      res.status(200).json(whitelists)
    })
  })

  app.get('/whitelists/:id', staff, function (req, res) {
    var id = req.params.id
    log('Request /whitelists/%s', id)

    api.whitelist.get(id, function (err, whitelist) {
      if (err) return _handleError(err, req, res)

      log('Serving whitelist %j', whitelist)

      res.status(200).json(whitelist)
    })
  })

  app.post('/whitelists/create', staff, function (req, res, next) {
    log('Request /whitelists/create %j', req.body)

    api.whitelist.create(req.body, function (err, whitelists) {
      if (err) return next(err)
      log('Serving whitelists %s', pluck(whitelists, 'id'))
      req.whitelists = whitelists
      next()
    })
  }, function (req, res, next) {
    var whitelists = req.whitelists

    var batch = new Batch()

    whitelists.forEach(function (whitelist) {
      if (isEmpty(whitelist)) return
      batch.push(function (done) {
        return api.user.findByWhitelist(whitelist, done)
      })
    })

    batch.end(function (err, users) {
      if (err) return _handleError(err, req, res)
      req.users = users
      next()
    })
  }, function (req, res, next) {
    var whitelists = req.whitelists
    var users = req.users
    users = unique(flatten(users), function (a, b) {
      return a.id === b.id
    })
    log('Granting permissions for users %s', pluck(users, 'id'))
    if (isEmpty(users)) return res.status(200).json(whitelists)

    var batch = new Batch()

    users.forEach(function (user) {
      if (isEmpty(user)) return
      batch.push(function (done) {
        api.forum.grantPermission(req.body.forum, user, 'participant')
          .then(done)
          .catch((err) => {
            log('Found error: ', err)
            return done(err)
          })
      })
    })

    batch.end(function (result) {
      return res.status(200).json(whitelists)
    })
  })

  app.post('/whitelists/:id', staff, function (req, res) {
    log('Request /whitelists/:id %j', req.params.id, req.body)

    api.whitelist.update(req.params.id, req.body, function (err, whitelist) {
      if (err) return _handleError(err, req, res)

      log('Serving whitelist %s', whitelist)
      res.status(200).json(whitelist.toJSON())
    })
  })

  app.delete('/whitelists/:id', staff, function (req, res) {
    var id = req.params.id
    log('Request /whitelists/%s', id)

    api.whitelist.remove(id, function (err) {
      if (err) return _handleError(err, req, res)

      log('Whitelist %j deleted successfully', id)

      res.status(200).send()
    })
  })
}
