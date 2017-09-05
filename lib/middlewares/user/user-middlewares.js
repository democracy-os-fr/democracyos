import debug from 'debug'
import userStore from '../../stores/user-store/user-store'

const log = debug('democracyos:user-middlewares')

/**
 * Clear user store, to force a fetch to server on next call
 */

export function clearUserStore (ctx, next) {
  userStore.clear()
  next()
}

export function findAllUsers (ctx, next) {
  userStore
    .findAll()
    .then((users) => {
      ctx.users = users
      next()
    })
    .catch((err) => {
      if (err.status !== 404) throw err
      const message = 'Unable to load users'
      return log(message, err)
    })
}

/**
 * Load specific user from context params
 */

export function findUser (ctx, next) {
  userStore
    .findOne(ctx.params.id)
    .then((user) => {
      ctx.user = user
      return next()
    })
    .catch((err) => {
      if (err.status !== 404) throw err
      const message = 'Unable to load user for ' + ctx.params.id
      return log(message, err)
    })
}
