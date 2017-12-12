const config = require('lib/config')

exports.restrict = function restrict (req, res, next) {
  if (req.user) return next()

  const err = new Error('User is not logged in.')
  err.status = 403
  err.code = 'NOT_LOGGED_IN'

  return next(err)
}

exports.system = function system (req, res, next) {
  if (req.user.staff || (config.multiForum && req.user.privileges && req.user.privileges.canManage)) return next()
  // if (user.staff) return next()

  const err = new Error('Access forbidden.')
  err.status = 403
  err.code = 'RESTRICTED'

  return next(err)
}
