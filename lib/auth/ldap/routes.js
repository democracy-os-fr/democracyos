/**
 * Module dependencies.
 */

var express = require('express')
var passport = require('passport')
var log = require('debug')('democracyos:auth:ldap')
var jwt = require('lib/jwt')

/**
 * NOT USED
 * just for debug
 */

var app = module.exports = express()

app.post('/auth/ldap', function (req, res, next) {
  log('route /auth/ldap')
  req.body.username = req.body.email.split('@')[0]
  log(req.body)
  return next()
}, passport.authenticate('ldapauth', { session: false }), function (req, res) {
  log('Log in user %s', req.user.id)
  jwt.setUserOnCookie(req.user, res)
  // return res.redirect('/')
  return res.status(200).send({ status: 'ok' })
})
