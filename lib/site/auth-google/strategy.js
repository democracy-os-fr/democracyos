var passport = require('passport')
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
var config = require('lib/config')
var User = require('lib/models').User
var utils = require('lib/utils')

/**
 * Register Google Strategy
 */

module.exports = function () {
  const callbackURL = utils.buildUrl(config, {
    pathname: '/auth/google/callback'
  })

  const strategy = new GoogleStrategy({
    clientID: config.auth.google.clientID,
    clientSecret: config.auth.google.clientSecret,
    callbackURL: callbackURL,
    scope: ['email', 'profile']
  }, function (accessToken, refreshToken, profile, done) {
    User.findByProvider(profile, function (err, user) {
      if (err) return done(err)

      var email = profile.emails[0].value
      // if( config.domainWhiteList.length ) {
      //   if( !~config.domainWhiteList.indexOf(email.split('@')[1]) ) {
      //     log('user NOT in white list domains');
      //     return done(null, false, { message: 'Unauthorized domain : ' + email  });
      //   }
      // }
      if (!user) {
        if (email) {
          User.findByEmail(email, function (err, userWithEmail) {
            if (err) return done(err)

            if (userWithEmail) {
              assignProfile(userWithEmail, profile, accessToken, done)
            } else {
              assignProfile(new User(), profile, accessToken, done)
            }
          })
        } else {
          assignProfile(new User(), profile, accessToken, done)
        }

        return
      }

      if (user.email !== email) {
        user.set('email', email)
        user.set('profiles.google.email', email)
      }

      if (user.profiles.google.deauthorized) {
        user.set('profiles.google.deauthorized')
      }

      user.isModified() ? user.save(done) : done(null, user)
    })
  })

  passport.use(strategy)
}

/**
 * Google Registration
 *
 * @param {Object} profile PassportJS's profile
 * @param {Function} fn Callback accepting `err` and `user`
 * @api public
 */

function assignProfile (user, profile, accessToken, fn) {
  try {
    user.set('profiles.google', profile._json)
    user.set('emailValidated', true)
    user.set('profilePictureUrl', profile._json.image.url)

    if (profile._json.name.givenName) {
      user.set('firstName', profile._json.name.givenName)
    }

    if (profile._json.name.familyName) {
      user.set('lastName', profile._json.name.familyName)
    }

    if (profile.emails[0].value) {
      user.set('email', profile.emails[0].value)
    }

    user.save(fn)
  } catch (err) {
    console.error(err)
    return fn(new Error('Couldn\'t signup with google.'), user)
  }
}
