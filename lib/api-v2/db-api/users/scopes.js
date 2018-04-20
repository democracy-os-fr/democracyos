const expose = require('lib/utils').expose

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
  ],

  select: [
    'email',
    'profilePictureUrl'
  ]
}

exports.ordinary.select = exports.ordinary.keys.expose.concat(
  exports.ordinary.keys.select
).join(' ')

exports.ordinary.expose = expose(exports.ordinary.keys.expose)
