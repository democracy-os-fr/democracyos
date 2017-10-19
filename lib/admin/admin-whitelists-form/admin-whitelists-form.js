import debug from 'debug'
import page from 'page'
import urlBuilder from 'lib/url-builder'
import request from '../../request/request'
import { privileges } from '../../middlewares/forum-middlewares/forum-middlewares'
import FormView from './form-view'

const log = debug('democracyos:admin-whitelists-form')

page(urlBuilder.for('admin.users.create'), privileges('canEdit'), function (ctx, next) {
  var form = new FormView({
    forum: ctx.forum
  })
  form.replace('.admin-content')
  ctx.sidebar.set('users')
})

page(urlBuilder.for('admin.users.id'), privileges('canEdit'), load, function (ctx, next) {
  var form = new FormView(ctx)
  form.replace('.admin-content')
  ctx.sidebar.set('users')
})

/**
 * Load specific whitelist from context params
 */

function load (ctx, next) {
  request
    .get('/api/whitelists/' + ctx.params.id)
    .end(function (err, res) {
      if (err || !res.ok) {
        var message = 'Unable to load whitelists for ' + ctx.params.id
        console.error(message)
        return log(message)
      }

      ctx.whitelist = res.body
      return next()
    })
}
