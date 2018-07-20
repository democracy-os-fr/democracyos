exports.restrict = function restrict (req, res, next) {
  if (req.user) return next()

  const err = new Error('User is not logged in.')
  err.status = 403
  err.code = 'NOT_LOGGED_IN'

  return next(err)
}

exports.staff = function staff (req, res, next) {
  if (req.user && req.user.staff) return next()
  const err = new Error('User is not STAFF.')
  err.status = 403
  err.code = 'NOT_STAFF'

  return next(err)
}
