const { Forum, User } = require('lib/models')
const forumScopes = require('../forums/scopes')
const userScopes = require('../users/scopes')

exports.searchForum = function searchForum (opts, query) {
  opts = opts || {}

  return Forum.find({
    deletedAt: null,
    visibility: { $in: ['public', 'closed'] },
    $text: {
      $search: query,
      $caseSensitive: false,
      $diacriticSensitive: false
    }
  })
    .populate(forumScopes.ordinary.populate)
    .select(forumScopes.ordinary.select)
    .limit(opts.limit)
    .skip((opts.page - 1) * opts.limit)
    .exec()
    .then((forums) => forums.map(forumScopes.ordinary.expose))
}

exports.searchUser = function searchUser (opts, query) {
  opts = opts || {}

  // snippets for Text Index Search (MongoDB)
  // $text: {
  //   $search: query,
  //   $caseSensitive: false,
  //   $diacriticSensitive: false
  // }

  return User.find({
    disabledAt: null,
    username: { $regex: `.*${query}.*`, $options: 'i' }
  }).limit(opts.limit)
  .skip((opts.page - 1) * opts.limit)
  .exec()
  .then((users) => {
    return users.map(userScopes.ordinary.expose)
  })
}
