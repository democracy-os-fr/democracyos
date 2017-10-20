/**
 * Module dependencies.
 */

const Batch = require('batch')
const log = require('debug')('democracyos:signup-strategy')
const config = require('lib/config')
const api = require('lib/db-api')

function SignupStrategy () {
  if (!(this instanceof SignupStrategy)) {
    return new SignupStrategy()
  }

  this.strategies = []
}

SignupStrategy.prototype.use = function (strategy) {
  this.strategies.push(strategy)

  return this
}

SignupStrategy.prototype.signup = function (user, callback) {
  var batch = new Batch()

  this.strategies.forEach(function (Strategy) {
    batch.push(new Strategy(user))
  })

  batch.end(function (res) {
    if (res) {
      if (!res.isArray) {
        log('Found error signing up: %s', res.message)
        return callback(res.message)
      }

      if (config.usersWhitelist) {
        var buffer = []
        for (var wl of res) {
          if (wl.forum && (!buffer.includes(wl.forum.id))) {
            buffer.push(wl.forum.id)
            api.forum.grantPermission(wl.forum.id, user, 'participant')
            .catch((err) => {
              log('Found error: ', err)
              return callback(err)
            })
          }
        }
      }
    }

    callback(null, true)
  })

  return this
}

module.exports = SignupStrategy
