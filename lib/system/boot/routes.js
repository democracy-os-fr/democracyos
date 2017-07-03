const urlBuilder = require('lib/url-builder')

module.exports = function systemRoutes (multiForum) {
  urlBuilder.register('system', '/system')
  urlBuilder.register('system.wild', '/system/*')
  urlBuilder.register('system.section', '/system/:section')
  urlBuilder.register('system.section.wild', '/system/:section/*')
  urlBuilder.register('system.forums', '/system/forums')
  urlBuilder.register('system.forums.create', '/system/forums/create')
  urlBuilder.register('system.users', '/system/users')
}
