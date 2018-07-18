import React from 'react'
import { render } from 'react-dom'
import page from 'page'
import o from 'component-dom'
import user from 'lib/user/user'
import { dom } from 'lib/render/render'
import config from 'lib/config/config'
import title from 'lib/title/title'
import urlBuilder from 'lib/url-builder'
import { findAllTags, findTag, clearTagStore } from '../middlewares/tag-middlewares/tag-middlewares'
import { findAllUsers, clearUserStore } from '../middlewares/user/user-middlewares'
import { findForum } from '../middlewares/forum-middlewares/forum-middlewares'
import AdminUpload from './uploads/upload'
import UsersList from './users/view'
import TagsList from './tags/view'
import TagForm from './tags/form'
import ForumsListView from './forums/view'
import ForumForm from './forums/form'
import UserBadge from './user-badges/view'
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
page(urlBuilder.for('system.upload'), (ctx) => {
  render(<AdminUpload />, document.querySelector('#system-content'))
})

page(urlBuilder.for('system.forums'), hasAccess, (ctx) => {
  let form = new ForumsListView(ctx.forum)
  form.replace('#system-content')
})

page(urlBuilder.for('system.forums.create'), hasAccess, (ctx) => {
  let form = new ForumForm(ctx.forum)
  form.replace('#system-content')
})

page(urlBuilder.for('system.forums.copy'), hasAccess, findForum, (ctx) => {
  let form = new ForumForm(ctx.forum)
  form.replace('#system-content')
})

page(urlBuilder.for('system.tags'), hasAccess, clearTagStore, findAllTags, (ctx) => {
  let form = new TagsList({
    tags: ctx.tags
  })
  form.replace('#system-content')
})

page(urlBuilder.for('system.tags.create'), hasAccess, (ctx) => {
  let form = new TagForm()
  form.replace('#system-content')
})

page(urlBuilder.for('system.tags.id'), hasAccess, findTag, (ctx) => {
  let form = new TagForm(ctx.tag)
  form.replace('#system-content')
})

page(urlBuilder.for('system.users'), hasAccess, clearUserStore, findAllUsers, (ctx) => {
  let form = new UsersList({
    users: ctx.users
  })
  form.replace('#system-content')
})

page(urlBuilder.for('system.user-badges'), hasAccess, (ctx) => {
  let form = new UserBadge()
  form.replace('#system-content')
})
function hasAccess (ctx, next) {
  if (user.staff || (config.multiForum && user.privileges && user.privileges.canManage)) return next()
  // if (user.staff) return next()
  page.redirect('/')
}
