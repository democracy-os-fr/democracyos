/**
 * Module dependencies.
 */

var t = require('t-component')
var { isArray } = require('mout/lang')
var api = require('lib/db-api').whitelist
var config = require('lib/config')

function EmailWhitelist (opts) {
  return function (user) {
    return function (done) {
      if (!config.usersWhitelist) return done()
      if (~config.staff.indexOf(user.email)) return done()

      api.search({ type: 'email', value: user.email }, function (err, emails) {
        if (err) return done(err)

        // if (emails.length) {
        //   return done(emails)
        // } else {
        //   return done(new Error(t('signup.whitelist.email', { email: user.email })))
        // }

        return done(isArray(emails) ? emails : [emails])
      })
    }
  }
}

module.exports = EmailWhitelist
