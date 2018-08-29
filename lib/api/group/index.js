var express = require('express')
var Log = require('debug')
var api = require('lib/db-api')
var utils = require('lib/utils')
var staff = utils.staff
var pluck = utils.pluck

var log = new Log('democracyos:forum-api')

var app = module.exports = express()

app.post('/group/create', function (req, res, next) {
  log('Request /group/create %j', req.body)
  req.body.users.push(req.user._id)
  api.group.create(req.body, function (err, group) {
    if (err) return next(err)
    log('Serving group %s', group)
    req.group = group
    next()
  })
}, function (req, res) {
  res.status(200).json(req.group)
})

app.get('/group/all', function (req, res) {
  log('Request /group/all')
  api.group.all(function (err, groups) {
    if (err) return _handleError(err, req, res)

    log('Serving groups %j', pluck(groups, 'id'))

    res.status(200).json(groups)
  })
})

function _handleError (err, req, res) {
  log('Error found: %s', err)
  var error = err
  if (err.errors && err.errors.text) error = err.errors.text
  if (error.type) error = error.type

  res.status(400).json({ error: error })
}

app.delete('/group/:id', staff, function (req, res) {
  var id = req.params.id
  log('Request /group/%s', id)

  api.group.remove(id, function (err) {
    if (err) return _handleError(err, req, res)

    log('group %j deleted successfully', id)

    res.status(200).send()
  })
})

app.get('/group/:id', function (req, res) {
  var id = req.params.id
  log('Request /group/%s', id)

  api.group.get(id, function (err, group) {
    if (err) return _handleError(err, req, res)

    log('Serving group %j', group)

    res.status(200).json(group)
  })
})
app.post('/group/update/:id', function (req, res, next) {
  log('Request /group/:id %j', req.params.id, req.body)

  api.group.update(req.params.id, req.body, function (err, group) {
    if (err) return _handleError(err, req, res)

    log('Serving group %s', group)
    req.group = group
    next()
  })
}, function (req, res) {
  res.status(200).json(req.group.toJSON())
})
app.get('/group/getByName/:name', function (req, res) {
  var name = req.params.name
  log('Request /group/%s', name)

  api.group.findOneByName(name, function (err, group) {
    if (err) return _handleError(err, req, res)

    log('Serving group %j', group)

    res.status(200).json(group)
  })
})
app.get('/group/search/:name', function (req, res) {
  var name = req.params.name
  log('Request /group/%s', name)

  api.group.search(name, function (err, groups) {
    if (err) return _handleError(err, req, res)

    log('Serving groups %j', groups)

    res.status(200).json(groups)
  })
})
