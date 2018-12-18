const expose = require('lib/utils').expose
const config = require('lib/config')

exports.ordinary = {}

exports.ordinary.keys = {
  expose: [
    'id',
    'firstName',
    'lastName',
    'fullName',
    'username',
    'displayName',
    'avatar',
    'badge',
    'extra',
    'hasExtProfile',
    'updateOnNextLogin'
  ].concat(config.publicEmails ? ['email'] : []),

  select: [
    'email',
    'profilePictureUrl'
  ]
}

exports.ordinary.select = exports.ordinary.keys.expose.concat(
  exports.ordinary.keys.select
).join(' ')

exports.ordinary.expose = expose(exports.ordinary.keys.expose)
