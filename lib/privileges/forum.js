const Log = require('debug')
const config = require('lib/config')
const execAll = require('lib/utils/exec-all')
const log = new Log('democracyos:privileges:forum')

/**
* Privileges are the calculated actions users can make.
*
* These are calculated verifying:
* + Forum Visibility
* + If User is owner of a forum
* + User Role on Forum Permissions
*
*/

var privileges = {
  canView: function canView (forum, user) {
    log('forum %s (%s)', forum.title, forum.name)
    if (!config.multiForum && user && user.staff) return true
    log('not staff')
    if (forum.hasVisibility('public', 'closed', 'collaborative')) return true
    log('private')
    log('isOwner : %o', forum.isOwner(user))
    log('hasRole : %o', forum.hasRole(user))
    return forum.isOwner(user) || forum.hasRole(user)
  },

  canEdit: function canEdit (forum, user) {
    if (!config.multiForum && user && user.staff) return true
    return forum.isOwner(user) || forum.hasRole(user, 'admin')
  },

  canDelete: function canDelete (forum, user) {
    if (!config.multiForum && user && user.staff) return true
    return forum.isOwner(user)
  },

  canVoteAndComment: function canVoteAndComment (forum, user) {
    if (forum.hasVisibility('public', 'collaborative')) return true
    if (!config.multiForum && user && user.staff) return true
    return forum.isOwner(user) || forum.hasRole(user)
  },

  canCreateTopics: function canCreateTopics (forum, user) {
    if (!config.multiForum && user && user.staff) return true
    if (forum.hasVisibility('collaborative')) return true
    return forum.isOwner(user) || forum.hasRole(user, 'admin', 'collaborator', 'author')
  },

  canChangeTopics: function canChangeTopics (forum, user) {
    if (!config.multiForum && user && user.staff) return true
    return forum.isOwner(user) || forum.hasRole(user, 'admin', 'collaborator', 'author')
  },

  canPublishTopics: function canPublishTopics (forum, user) {
    if (!config.multiForum && user && user.staff) return true
    if (forum.hasVisibility('collaborative')) return true
    return forum.isOwner(user) || forum.hasRole(user, 'admin')
  },

  canDeleteComments: function canDeleteComments (forum, user) {
    if (!config.multiForum && user && user.staff) return true
    if (config.moderatorEnabled && forum.hasRole(user, 'moderator')) return true
    return forum.isOwner(user) || forum.hasRole(user, 'admin')
  }
}

/**
 * Retrieve all the privileges of a user on a specific forum.
 */

privileges.all = execAll(privileges)

module.exports = privileges
