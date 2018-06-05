const findIndex = require('mout/array/findIndex')
const filter = require('mout/array/filter')
const unique = require('mout/array/unique')
const union = require('mout/array/union')
const pluck = require('mout/array/pluck')
const isSame = require('mout/date/isSame')

/**
* Check for vote status of user
*
* @param {ObjectId} user
* @param {ObjectId} topic
* @api public
*/

exports.votedBy = function votedBy (user, comment) {
  if (!user || (comment.votes.lenght === 0)) return Promise.resolve(false)
  return findIndex(comment.votes, { author: user._id }) > 0
}

/**
* Calculate statistics
*
* @param {ObjectId} topic
* @api public
*/

exports.calcStats = function calcStats (comment) {
  const authors = function (a, b) {
    const aId = a.get ? a.get('_id') : a
    const bId = b.get ? b.get('_id') : b
    return aId.equals ? aId.equals(bId) : aId === bId
  }

  let voters = unique(pluck(comment.votes, 'author'), authors)
  let repliers = unique(pluck(comment.replies, 'author'), authors)
  let participants = unique(union(voters, repliers), authors)

  let today = function (val, key, arr) {
    return isSame(new Date(), val, 'day')
  }

  return {
    votes: comment.votes.length,
    voters: voters.length,
    replies: comment.replies.length,
    repliers: repliers.length,
    votedToday: filter(pluck(comment.votes, 'createdAt'), today).lenght,
    repliedToday: filter(pluck(comment.replies, 'createdAt'), today).lenght,
    participants: participants.length
  }
}
