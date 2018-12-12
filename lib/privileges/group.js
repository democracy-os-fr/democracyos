const arraySearch = require('mout/array/find')
const execAll = require('lib/utils/exec-all')

/**
* Privileges are the calculated actions users can make.
*/

var privileges = {
  canCreate: function canCreate (user, group) {
    console.log('canCreate')
    console.dir(user)
    console.dir(group)
    if (user) return true
    return false
  },

  canEdit: function canEdit (user, group) {
    if (user && user.staff) return true
    if (arraySearch(group.owners)) return true
    return false
  },

  canManage: function canManage (user, group) {
    if (user && user.staff) return true
    return false
  }
}

/**
 * Retrieve all the privileges of a user on a specific topic.
 */

privileges.all = execAll(privileges)

module.exports = privileges
