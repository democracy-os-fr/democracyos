const isEmpty = require('mout/lang/isEmpty')
const expose = require('lib/utils').expose
const userScopes = require('../users/scopes')

exports.ordinary = {}

exports.ordinary.keys = {
  expose: [
    'id',
    'name',
    'description',
    'logoUrl',
    'justificatoryUrl'
  ],

  select: [
    'users',
    'owners'
  ]
}

exports.ordinary.populate = {
  path: 'users owners',
  select: userScopes.ordinary.select
}

exports.ordinary.lookup = [
  {
    from: 'users',
    localField: 'users',
    foreignField: '_id',
    as: 'users'
  },
  {
    from: 'users',
    localField: 'owners',
    foreignField: '_id',
    as: 'owners'
  }
]

exports.ordinary.select = exports.ordinary.keys.expose.concat(
  exports.ordinary.keys.select
).join(' ')

exports.ordinary.expose = (function () {
  const exposeFields = expose(exports.ordinary.select)

  function exposeGroup (group) {
    const json = exposeFields(group)

    if (!isEmpty(json.users)) {
      json.users = json.users.map((user) => userScopes.ordinary.expose(user))
    }

    if (!isEmpty(json.owners)) {
      json.owners = json.owners.map((user) => userScopes.ordinary.expose(user))
    }

    return json
  }

  return function ordinaryExpose (group, user) {
    return exposeGroup(group.toJSON())
  }
})()
