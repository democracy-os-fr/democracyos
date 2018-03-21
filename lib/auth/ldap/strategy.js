var passport = require('passport')
var LdapStrategy = require('passport-ldapauth').Strategy
var debug = require('debug')
var pick = require('mout/object/pick')
var guid = require('mout/random/guid')
var config = require('lib/config')
var User = require('lib/models').User

var log = debug('democracyos:auth:ldap:strategy')
/**
 * Register Facebook Strategy
 */

module.exports = function () {
  // log(config.auth.ldap)
  const strategy = new LdapStrategy({
    server: config.auth.ldap.options.server,
    handleErrorsAsFailures: true
  }, function (data, done) {
    log(data)

    var email = data.mail

    User.findByEmail(email, function (err, user) {
      if (err) return done(err)
      if (!user) {
        return assignProfile(new User(), data, done)
      } else if (!user.hasExtProfile || user.updateOnNextLogin) {
        user.set('profiles.updateOnNextLogin', false)
        return assignProfile(user, data, done)
      } else {
        done(null, user)
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
    // LDAP profiles can contain sensitive information --> pick only important data
    user.set('profiles.ldap', pick(data, [ 'uid', 'dn', 'cn', 'gn', 'sn', 'mail' ]))
    user.set('emailValidated', true)

    if (data.sn) {
      user.set('username', data.sn)
    } else if (data.uid) {
      user.set('username', data.uid)
    } else {
      user.set('username', guid())
    }

    if (data.cn) {
      if (data.gn) {
        user.set('firstName', data.gn)
        user.set('lastName', data.cn)
      } else {
        var names = data.cn.split(' ')
        user.set('firstName', names.shift())
        if (names.length > 0) {
          user.set('lastName', names.join(' '))
        }
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
