const privileges = require('lib/privileges/group')
const api = require('../db-api')

exports.privileges = Object.keys(privileges).reduce((middles, privilege) => {
  function middleware (req, res, next) {
    if (privileges[privilege](req.user, req.group)) return next()

    const err = new Error('User doesn\'t have enough privileges on groups.')
    err.status = 403
    err.code = 'LACK_PRIVILEGES'

    next(err)
  }

  middles[privilege] = middleware
  return middles
}, {})

exports.findById = function findById (req, res, next) {
  const id = req.params.id

  api.groups.get({ _id: id }, { user: req.user })
  .then((group) => {
    if (!group) return next(new Error404(id, 'group'))
    req.group = group
    next()
  })
  .catch(next)
}

class Error404 extends Error {
  constructor (id, type) {
    super(`${type} ${id} not found.`)

    this.status = 404
    switch (type) {
      case 'group':
        this.code = 'GROUP_NOT_FOUND'
        break
      case 'user':
        this.code = 'USER_NOT_FOUND'
        break
      default:
        this.code = 'NOT_FOUND'
    }
  }
}
