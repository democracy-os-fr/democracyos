const ObjectID = require('mongoose').Types.ObjectId
const pluck = require('mout/array/pluck')
const shuffle = require('mout/array/shuffle')
const merge = require('mout/object/merge')
const isSame = require('mout/date/isSame')
const log = require('debug')('democracyos:api:db:comments')
const moment = require('moment')
const config = require('lib/config')
const Comment = require('lib/models').Comment
const Topic = require('lib/models').Topic
const privileges = require('lib/privileges/forum')
const privilegesTopic = require('lib/privileges/topic')
const urlBuilder = require('lib/url-builder')
const calcTopicStats = require('../topics/utils').calcStats
const scopes = require('./scopes')

/**
 * Default find Method, to be used in favor of Model.find()
 * @method find
 * @param  {object} query - Mongoose query options
 * @return {Mongoose Query}
 */
function find (query) {
  return Comment.find(Object.assign({
    context: 'topic'
  }, query))
}

exports.find = find

function findRandom (query, n = 3) {
  return Comment.collection.aggregate([
    { $match: query },
    { $sample: { size: n } },
    { $project: { _id: true } }
  ])
}

exports.findRandom = findRandom

/**
 * Get the public listing of comments from a topic
 * @method list
 * @param  {object} opts
 * @param  {objectId} opts.topicId
 * @param  {number} opts.limit - Amount of results per page
 * @param  {number} opts.page - Page number
 * @param  {document} opts.user - User data is beign fetched for
 * @param  {('score'|'-score'|'createdAt'|'-createdAt')} opts.sort
 * @return {promise}
 */
exports.list = function list (opts) {
  opts = opts || {}
  const random = config.sorts.comment.random && (opts.sort === 'random')
  return find()
    .where({ reference: opts.topicId })
    .populate(scopes.ordinary.populate)
    .select(scopes.ordinary.select)
    .limit(opts.limit)
    .skip((opts.page - 1) * opts.limit)
    .sort(random ? null : opts.sort)
    .exec()
    .then((comments) => random ? shuffle(comments) : comments)
    .then((comments) => comments.map((comment) => {
      return scopes.ordinary.expose(comment, opts.user)
    }))
}

/**
 * Get the count of total commenters
 * @method listCount
 * @param  {object} opts
 * @param  {objectId} opts.topicId
 * @return {promise}
 */
exports.commentersCount = function commentersCount (opts) {
  opts = opts || {}

  return find()
    .where({ reference: opts.topicId })
    .exec()
    .then((comments) => {
      const replies = comments
        .reduce((acc, commentReplies) => acc.concat(commentReplies), [])

      const count = comments.concat(replies)
        .map((comment) => comment.author.toString())
        .filter((comment, index, commentsArr) => commentsArr.indexOf(comment) === index)
        .length

      return count
    })
}

/**
 * Get the count of total comments of the public listing
 * @method listCount
 * @param  {object} opts
 * @param  {objectId} opts.topicId
 * @return {promise}
 */
exports.listCount = function listCount (opts) {
  opts = opts || {}

  return find()
    .where({ reference: opts.topicId })
    .count()
    .exec()
}

/**
 * Create or Update a vote on a comment
 * @method vote
 * @param  {object} opts
 * @param {string} opts.id - Comment Id
 * @param {document} opts.user - Author of the vote
 * @param {('positive'|'negative')} opts.value - Vote value
 * @return {promise}
 */
exports.vote = function vote (opts) {
  const id = opts.id
  const user = opts.user
  const value = opts.value

  return find()
    .findOne()
    .where({ _id: id })
    .populate(scopes.ordinary.populate)
    .select(scopes.ordinary.select)
    .exec()
    .then(verifyAutovote.bind(null, user))
    .then(doVote.bind(null, user, value))
    // .then((comment) => updateTopic({ comment }))
    // .then((results) => scopes.ordinary.expose(results.comment, user))
    .then((comment) => scopes.ordinary.expose(comment, user))
}

function verifyAutovote (user, comment) {
  if (comment.author.equals(user._id)) {
    const err = new Error('A user can\'t vote his own comment.')
    err.code = 'NO_AUTOVOTE'
    err.status = 400
    throw err
  }
  return comment
}

function doVote (user, value, comment) {
  return new Promise((resolve, reject) => {
    comment.vote(user, value, function (err) {
      if (err) return reject(err)
      resolve(comment)
    })
  })
}

/**
 * Create or Update a vote on a comment
 * @method vote
 * @param  {object} opts
 * @param {string} opts.id - Comment Id
 * @param {document} opts.user - Author of the vote
 * @param {('positive'|'negative')} opts.value - Vote value
 * @return {promise}
 */
exports.unvote = function unvote (opts) {
  const id = opts.id
  const user = opts.user

  return find()
    .findOne()
    .where({ _id: id })
    .populate(scopes.ordinary.populate)
    .select(scopes.ordinary.select)
    .exec()
    .then(doUnvote.bind(null, user))
    // .then((comment) => updateTopic({ comment }))
    // .then((results) => scopes.ordinary.expose(results.comment, user))
    .then((comment) => scopes.ordinary.expose(comment, user))
}

function doUnvote (user, comment) {
  return new Promise((resolve, reject) => {
    comment.unvote(user, function (err) {
      if (err) return reject(err)
      resolve(comment)
    })
  })
}

/**
 * Create a comment
 * @method create
 * @param  {object} opts
 * @param {string} opts.text - Comment text
 * @param {document} opts.user - Author of the comment
 * @param {document} opts.topicId - Topic where the comment is beign created
 * @return {promise}
 */
exports.create = function create (opts) {
  const title = opts.title
  const text = opts.text
  const user = opts.user
  const topicId = opts.topicId

  return Comment
    .create({
      title: title,
      text: text,
      context: 'topic',
      reference: topicId,
      author: user
    })
    // .then((comment) => updateTopic({ comment }))
    // .then((results) => scopes.ordinary.expose(results.comment, user))
    .then((comment) => scopes.ordinary.expose(comment, user))
}

/**
 * Create a reply
 * @method reply
 * @param  {object} opts
 * @param {string} opts.text - Reply text
 * @param {document} opts.user - Author of the comment
 * @param {document} opts.id - Comment id
 * @return {promise}
 */
exports.reply = function reply (opts) {
  const text = opts.text
  const user = opts.user
  const id = opts.id

  return find()
    .findOne()
    .where({ _id: id })
    .populate(scopes.ordinary.populate)
    .select(scopes.ordinary.select)
    .exec()
    .then(doReply.bind(null, user, text))
    // .then(updateTopic.bind(null))
    .then((results) => ({
      comment: scopes.ordinary.expose(results.comment, user),
      reply: results.reply
    }))
}

function doReply (user, text, comment) {
  return new Promise((resolve, reject) => {
    const reply = comment.replies.create({
      text: text,
      author: user
    })
    const now = new Date()

    comment.replies.push(reply)
    comment.count.replies = comment.replies.length
    if (comment.lastRepliedAt && isSame(now, comment.lastRepliedAt, 'day')) {
      comment.count.repliedToday = comment.repliedAt(now).length
    }
    comment.lastRepliedAt = now
    comment.updateParticipation()

    comment.save((err, commentSaved) => {
      if (err) reject(err)

      resolve({
        comment: commentSaved,
        reply: reply
      })
    })
  })
}

/**
 * Delete comment
 * @method delete
 * @param  {object} opts
 * @param {document} opts.user - Author of the comment
 * @param {document} opts.id - Comment id
 * @return {promise}
 */
exports.removeComment = (function () {
  function verifyPrivileges (forum, user, comment) {
    if (privileges.canDeleteComments(forum, user)) return comment

    if (!comment.author.equals(user._id)) {
      const err = new Error('Can\'t delete comments from other users')
      err.code = 'NOT_YOURS'
      err.status = 400
      throw err
    }

    return comment
  }

  function verifyNoReplies (forum, user, comment) {
    if (privileges.canDeleteComments(forum, user)) return comment
    if (comment.replies.length > 0 && !user.staff) {
      const err = new Error('Can\'t delete comments with replies')
      err.code = 'HAS_REPLIES'
      err.status = 400
      throw err
    }
    return comment
  }

  function doRemoveComment (comment) {
    return new Promise((resolve, reject) => {
      comment.remove((err) => {
        if (err) reject(err)
        resolve(comment)
      })
    })
  }

  return function removeComment (opts) {
    const id = opts.id
    const forum = opts.forum
    const user = opts.user

    return find()
      .findOne()
      .where({ _id: id })
      .populate(scopes.ordinary.populate)
      .select(scopes.ordinary.select)
      .exec()
      .then(verifyPrivileges.bind(null, forum, user))
      .then(verifyNoReplies.bind(null, forum, user))
      .then(doRemoveComment)
      // .then((comment) => updateTopic({ comment }))
  }
})()

/**
 * Delete comment reply
 * @method delete
 * @param  {object} opts
 * @param {document} opts.user - Author of the comment
 * @param {document} opts.id - Comment id
 * @param {document} opts.replyId - Reply id
 * @return {promise}
 */
exports.removeReply = (function () {
  function verifyPrivileges (forum, user, replyId, comment) {
    if (privileges.canDeleteComments(forum, user)) return comment

    const reply = comment.replies.id(replyId)

    if (!reply.author.equals(user.id)) {
      const err = new Error('Can\'t delete replies from other users')
      err.code = 'NOT_YOURS'
      err.status = 400
      throw err
    }

    return comment
  }

  function doRemoveReply (user, replyId, comment) {
    const reply = comment.replies.id(replyId)
    const now = new Date()

    return new Promise((resolve, reject) => {
      reply.remove()
      comment.count.replies = comment.replies.length
      if (comment.lastRepliedAt && isSame(now, reply.createdAt, 'day') && isSame(now, comment.lastRepliedAt, 'day')) {
        comment.count.repliedToday = comment.repliedAt(now).length
        if (comment.count.repliedToday === 0) {
          comment.lastRepliedAt.remove()
        }
      }
      comment.updateParticipation()
      comment.save(function (err, _comment) {
        if (err) reject(err)
        resolve(_comment)
      })
    })
  }

  return function removeReply (opts) {
    const id = opts.id
    const user = opts.user
    const forum = opts.forum
    const replyId = opts.replyId

    return find()
      .findOne()
      .where({ _id: id })
      .populate(scopes.ordinary.populate)
      .select(scopes.ordinary.select)
      .exec()
      .then(verifyPrivileges.bind(null, forum, user, replyId))
      .then(doRemoveReply.bind(null, user, replyId))
      // .then((comment) => updateTopic({ comment }))
      // .then((results) => scopes.ordinary.expose(results.comment, user))
      .then((comment) => scopes.ordinary.expose(comment, user))
  }
})()

/**
 * Flag comment
 * @method vote
 * @param  {object} opts
 * @param {string} opts.id - Comment Id
 * @param {document} opts.user - Author of the vote
 * @return {promise}
 */
exports.flag = function flag (opts) {
  const id = opts.id
  const user = opts.user

  return find()
    .findOne()
    .where({ _id: id })
    .populate(scopes.ordinary.populate)
    .select(scopes.ordinary.select)
    .exec()
    .then(verifyAutoFlag.bind(null, user))
    .then(doFlag.bind(null, user))
    .then((comment) => scopes.ordinary.expose(comment, user))
}

function verifyAutoFlag (user, comment) {
  if (comment.author.equals(user._id)) {
    const err = new Error('A user can\'t flag his own comment.')
    err.code = 'NO_AUTO_FLAG'
    throw err
  }
  return comment
}

function doFlag (user, comment) {
  return new Promise((resolve, reject) => {
    comment.flag(user, 'spam', function (err) {
      if (err) return reject(err)
      resolve(comment)
    })
  })
}

/**
 * Unflag comment
 * @method vote
 * @param  {object} opts
 * @param {string} opts.id - Comment Id
 * @param {document} opts.user - Author of the vote
 * @return {promise}
 */
exports.unflag = function flag (opts) {
  const id = opts.id
  const user = opts.user

  return find()
    .findOne()
    .where({ _id: id })
    .populate(scopes.ordinary.populate)
    .select(scopes.ordinary.select)
    .exec()
    .then(verifyAutoUnflag.bind(null, user))
    .then(doUnflag.bind(null, user))
    .then((comment) => scopes.ordinary.expose(comment, user))
}

function verifyAutoUnflag (user, comment) {
  if (comment.author.equals(user._id)) {
    const err = new Error('A user can\'t flag his own comment.')
    err.code = 'NO_AUTO_FLAG'
    throw err
  }
  return comment
}

function doUnflag (user, comment) {
  return new Promise((resolve, reject) => {
    comment.unflag(user, function (err) {
      if (err) return reject(err)
      resolve(comment)
    })
  })
}

/**
 * Edit comment
 * @method vote
 * @param  {object} opts
 * @param {string} opts.id - Comment Id
 * @param {string} opts.text - Comment body
 * @param {document} opts.user - Author of the vote
 * @return {promise}
 */
exports.edit = function edit (opts) {
  const id = opts.id
  const user = opts.user
  const title = opts.title
  const text = opts.text

  return find()
    .findOne()
    .where({ _id: id })
    .populate(scopes.ordinary.populate)
    .select(scopes.ordinary.select)
    .exec()
    .then(verifyAuthorEdit.bind(null, user))
    .then(doEdit.bind(null, title, text))
    .then((comment) => scopes.ordinary.expose(comment, user))
}

function verifyAuthorEdit (user, comment) {
  if (!comment.author.equals(user._id)) {
    const err = new Error('A user can\'t edit other users comments.')
    err.code = 'NOT_YOURS'
    throw err
  }
  return comment
}

function doEdit (title, text, comment) {
  return new Promise((resolve, reject) => {
    comment.title = title
    comment.text = text
    comment.editedAt = Date.now()
    comment.save(function (err, comment) {
      if (err) return reject(err)
      resolve(comment)
    })
  })
}

/**
 * Edit reply
 * @method vote
 * @param  {object} opts
 * @param {string} opts.id - Comment Id
 * @param {string} opts.text - Comment body
 * @param {document} opts.user - Author of the vote
 * @return {promise}
 */
exports.editReply = function editReply (opts) {
  const id = opts.id
  const replyId = opts.replyId
  const user = opts.user
  const text = opts.text

  return find()
    .findOne()
    .where({ _id: id })
    .populate(scopes.ordinary.populate)
    .select(scopes.ordinary.select)
    .exec()
    .then(verifyAuthorEditReply.bind(null, user, replyId))
    .then(doEditReply.bind(null, text, replyId))
    .then((comment) => scopes.ordinary.expose(comment, user))
}

function verifyAuthorEditReply (user, replyId, comment) {
  const reply = comment.replies.id(replyId)
  if (!reply.author.equals(user._id)) {
    const err = new Error('A user can\'t edit other users replies.')
    err.code = 'NOT_YOURS'
    throw err
  }
  return comment
}

function doEditReply (text, replyId, comment) {
  return new Promise((resolve, reject) => {
    const reply = comment.replies.id(replyId)
    reply.text = text
    reply.editedAt = Date.now()
    comment.save(function (err, comment) {
      if (err) return reject(err)
      resolve(comment)
    })
  })
}

/**
 * Populate topics with their comments
 * @method vote
 * @param  {object} opts
 * @param {Array} topics - List of topics
 * @return {promise}
 */
exports.populateTopics = function populateTopics (topics) {
  let topicIds = topics.map((topic) => topic.id)

  topics = topics.map((topic) => {
    topic.comments = []
    return topic
  })

  return find({ reference: { $in: topicIds } })
    .populate(scopes.ordinary.populate)
    .select(scopes.ordinary.select)
    .exec()
    .then(function (comments) {
      if (!comments) {
        const err = new Error(`All comments csv not found.`)
        err.status = 404
        err.code = 'ALL_COMMENTS_CSV_NOT_FOUND'
        return err
      }

      comments.forEach((comment) => {
        const topicIn = topicIds.indexOf(comment.reference)
        topics[topicIn].comments.push(scopes.ordinary.expose(comment))
      })

      return topics
    })
}

exports.getFeaturedComments = function getFeaturedComments (opts) {
  const { type, topics, forum, user } = opts

  if (type && type === 'help') return this.getCommentsToVote(opts)

  let topicIds = topics.map((topic) => topic.id)

  let query = {
    context: 'topic',
    reference: {
      $in: topicIds
    }
  }

  let sort = { 'createdAt': -1 }
  if (type === 'voted') {
    sort = { 'count.votes': -1 }
  } else if (type === 'votedToday') {
    sort = { 'count.votedToday': -1 }
    query.lastVotedAt = {
      $gte: moment().startOf('day'),
      $lt: moment().endOf('day')
    }
  }

  return Comment.find(query)
    .sort(sort)
    .populate(scopes.ordinary.populate)
    .select(scopes.ordinary.select)
    .limit(3)
    .skip((opts.page - 1) * opts.limit)
    .exec()
    .then(function (comments) {
      if (!comments) {
        const err = new Error(`Last comments not found.`)
        err.status = 404
        err.code = 'LAST_COMMENTS_NOT_FOUND'
        return err
      }

      log('found %s featured comments of type %s', comments.length, type)

      return comments.map((comment) => {
        const topic = topics[topicIds.indexOf(comment.reference)]['_doc']
        topic.privileges = privilegesTopic.all(forum, user, topic)
        topic.id = topic._id
        topic.url = urlBuilder.for('site.topic', {
          id: topic.id,
          forum: forum.name
        })

        comment['_doc']['topic'] = topic
        return scopes.ordinary.expose(comment, opts.user)
      })
    })
}

exports.getCommentsToVote = function getCommentsToVote (opts) {
  const { topics, forum, user } = opts
  let topicIds = topics.map((topic) => topic.id)

  let query = {
    reference: {
      $in: topicIds
    }
  }

  if (user) {
    query = merge(query, {
      author: { $ne: user.id },
      'votes': {
        $not: {
          $elemMatch: {
            author: user.id
          }
        }
      }
    })
  }

  return findRandom(query, 3)
    .toArray()
    .then(function (comments) {
      if (!comments) {
        const err = new Error(`Comments to vote not found.`)
        err.status = 404
        err.code = 'COMMENTS_TO_VOTE_NOT_FOUND'
        return err
      }

      return Comment.find({
        _id: { $in: pluck(comments, '_id') }
      })
        .populate(scopes.ordinary.populate)
        .select(scopes.ordinary.select)
        .exec()
        .then(function (_comments) {
          if (!_comments) {
            const err = new Error(`Last comments not found.`)
            err.status = 404
            err.code = 'LAST_COMMENTS_NOT_FOUND'
            return err
          }

          log('found %s comments to vote for user %s', comments.length, user ? user.id : '<anon>')

          return _comments.map((comment) => {
            const topic = topics[topicIds.indexOf(comment.reference)]['_doc']
            topic.privileges = privilegesTopic.all(forum, user, topic)
            topic.id = topic._id
            topic.url = urlBuilder.for('site.topic', {
              id: topic.id,
              forum: forum.name
            })
            comment['_doc']['topic'] = topic
            return scopes.ordinary.expose(comment, opts.user)
          })
        }).catch(function (error) {
          throw error
        })
    })
}

/* eslint-disable no-unused-vars */
function updateTopic (results) {
  const _id = new ObjectID(results.comment.reference)
  return calcTopicStats({ _id })
  .then((count) => Topic.collection.findOneAndUpdate({ _id }, { $set: { 'count': count } }))
  .then((topic) => {
    results.topic = topic
    return results
  })
}
/* eslint-enable */
