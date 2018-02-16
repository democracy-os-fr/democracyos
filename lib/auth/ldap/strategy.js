var passport = require('passport')
var LdapStrategy = require('passport-ldapauth').Strategy
var debug = require('debug')
var config = require('lib/config')
var User = require('lib/models').User

var log = debug('democracyos:auth:ldap:strategy')
/**
 * Register Facebook Strategy
 */

module.exports = function () {
  log(config.auth.ldap)
  const strategy = new LdapStrategy({
    server: config.auth.ldap.options.server,
    log: log
  }, function (data, done) {
    log(data)

    var email = data.mail

    User.findByEmail(email, function (err, user) {
      if (err) return done(err)
      if (user) {
        return assignProfile(user, data, done)
      } else {
        return assignProfile(new User(), data, done)
      }
    })
  })

  passport.use(strategy)
}

/**
 * Facebook Registration
 *
 * @param {Object} profile PassportJS's profile
 * @param {Function} fn Callback accepting `err` and `user`
 * @api public
 */

function assignProfile (user, data, fn) {
  try {
    user.set('profiles.ldap', data)
    user.set('emailValidated', true)

    if (data.cn) {
      var names = data.cn.split(' ')
      user.set('username', data.cn)
      user.set('firstName', names.shift())
      if (names.length > 0) {
        user.set('lastName', names.join(' '))
      }
    }

    if (data.mail) {
      user.set('email', data.mail)
    }
    return user.save(fn)
  } catch (err) {
    console.error(err)
    return fn(new Error('Couldn\'t signup with LDAP (assignProfile)'), data)
  }
}
