var urlBuilder = require('lib/url-builder')

module.exports = function (multiForum) {
  var forum = multiForum ? '/:forum' : ''

  urlBuilder.register('site.forum', forum || '/')
  urlBuilder.register('site.topic', forum + '/topic/:id')
  urlBuilder.register('site.help', '/help')
  urlBuilder.register('site.help.article', '/help/:article')
  urlBuilder.register('site.hub.faq', '/hub/faq')
  urlBuilder.register('site.hub.info', '/hub/info')
  urlBuilder.register('site.hub.solo.help', '/hub/solo/help')
  urlBuilder.register('site.hub.group.help', '/hub/group/help')
  urlBuilder.register('site.hub.group.all', '/hub/group/all')
  urlBuilder.register('site.hub.group.view', '/hub/group/:id')
  urlBuilder.register('site.notifications', '/notifications')
}
