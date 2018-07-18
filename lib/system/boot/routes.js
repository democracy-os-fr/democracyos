const urlBuilder = require('lib/url-builder')

module.exports = function systemRoutes (multiForum) {
  urlBuilder.register('system', '/system')
  urlBuilder.register('system.wild', '/system/*')
  urlBuilder.register('system.section', '/system/:section')
  urlBuilder.register('system.section.wild', '/system/:section/*')
  urlBuilder.register('system.forums', '/system/forums')
  urlBuilder.register('system.forums.create', '/system/forums/create')
  urlBuilder.register('system.forums.copy', '/system/forums/copy/:forum')
  urlBuilder.register('system.tags', '/system/tags')
  urlBuilder.register('system.tags.create', '/system/tags/create')
  urlBuilder.register('system.tags.id', '/system/tags/:id')
  urlBuilder.register('system.users', '/system/users')
  urlBuilder.register('system.users.create', '/system/users/create')
  // urlBuilder.register('system.users.id', '/system/users/:id')
  urlBuilder.register('system.user-badges', '/system/user-badges')
  urlBuilder.register('system.upload', '/system/upload')
}
