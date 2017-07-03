import page from 'page'
import o from 'component-dom'
import user from 'lib/user/user'
import { dom } from 'lib/render/render'
import config from 'lib/config/config'
import title from 'lib/title/title'
import urlBuilder from 'lib/url-builder'
import Forums from './forums/view'
import system from './container.jade'

/**
 * Redirect /system => /system/profile
 */
page(urlBuilder.for('system'), urlBuilder.for('system.forums'))

page([
  urlBuilder.for('system'),
  urlBuilder.for('system.section'),
  urlBuilder.for('system.section.wild')
], user.required, (ctx, next) => {
  const container = o(dom(system))
  const content = o('.content', container)
  const sidebar = o('.sidebar', container)

  // prepare wrapper and container
  o('#content').empty().append(container)

  // set active section on sidebar
  if (o('.active', sidebar)) {
    o('.active', sidebar).removeClass('active')
  }

  const menuItem = o(`[href="${ctx.path}"]`, sidebar)

  menuItem.addClass('active')

  // Set section's title
  title(menuItem.html())
  next()
})

page(urlBuilder.for('system.forums'), hasAccess, (ctx) => {
  // render topic form for edition
  let form = new Forums(ctx.forum)
  form.replace('#system .content-wrapper')
  console.log('LOL')
})

function hasAccess (ctx, next) {
  // if (config.multiForum && user.privileges && user.privileges.canManage) return next()
  console.log('hasAccess')
  if (user.staff) return next()
  page.redirect('/')
}
