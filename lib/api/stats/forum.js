/**
 * Module dependencies.
 */

var express = require('express')
// var mongoose = require('mongoose')
var log = require('debug')('democracyos:api:stats:forum')
var mongo = require('mongodb').MongoClient
var isEmpty = require('mout/lang/isEmpty')
var pluck = require('mout/array/pluck')
var findIndex = require('mout/array/findIndex')
var unique = require('mout/array/unique')
var pick = require('mout/object/pick')
var omit = require('mout/object/omit')
var accepts = require('lib/accepts')
// var api = require('lib/db-api')
// var utils = require('lib/utils')
// var restrict = utils.restrict
// var staff = utils.staff
var config = require('lib/config')
var app = module.exports = express()

log('loading democracyos:api:stats:forum')

/**
 * Limit request to json format only
 */
app.use(accepts(['application/json', 'text/html']))

function connect (req, res, next) {
  log('connect')
  mongo.connect(config.mongoUrl, { useNewUrlParser: true }, (err, db) => {
    if (err) { return handleError(req, res, err) }
    log('connected to %s', config.mongoUrl)
    req.db = db
    next()
    log('connection closed')
  })
}

app.param('name', (req, res, next, name) => {
  if (isEmpty(req.params.name)) {
    return handleError(req, res, new Error(`missing parameter name : ${req.params.name}`))
  }
  connect(req, res, () => {
    req.db.collection('forums')
      .findOne({ name: req.params.name })
      .then((forum) => {
        if (!forum) {
          return res.status(404).json({ error: 'forum not found' })
        }
        if (
            (
              (forum.visibility === 'private') &&
              (!req.user)
            ) ||
            (
              (forum.visibility === 'private') &&
              (!req.user.staff) && // not staff
              (forum.owner.toString() !== req.user._id.toString()) && // not owner
              (findIndex(forum.permissions, { user: req.user._id }) < 0) // not in permissions
            )
        ) {
          return res.status(403).json({ error: 'forum is private' })
        }
        req.forum = forum
        next()
      }).catch((e) => {
        if (e) { return handleError(req, res, e) }
      })
  })
})

function getTopics (req, res, next) {
  req.db.collection('topics')
    .find({
      forum: req.forum._id,
      publishedAt: { $exists: true },
      deletedAt: { $exists: false }
    })
    .toArray()
    .then((topics) => {
    // log('found %n topics %o', topics.length, pluck(topics, '_id'))
      log('found %o topics', topics.length)
      req.topics = topics
      next()
    }).catch((e) => {
      if (e) { return handleError(req, res, e) }
    })
}

function getComments (req, res, next) {
  req.db.collection('comments')
    .find({
      context: 'topic',
      reference: { $in: pluck(req.topics, '_id').map((o) => o.toString()) }
    })
    .toArray()
    .then((comments) => {
    // log('found %n comments %o', comments.length, pluck(comments, '_id'))
      log('found %o comments', comments.length)
      req.comments = comments
      next()
    }).catch((e) => {
      if (e) { return handleError(req, res, e) }
    })
}

function getVotes (req, res, next) {
  req.db.collection('votes')
    .find({
      'topic': { $in: pluck(req.topics, '_id') }
    })
    .toArray()
    .then((votes) => {
    // log('found %n votes %o', votes.length, pluck(votes, '_id'))
      log('found %o votes', votes.length)
      req.votes = votes
      next()
    }).catch((e) => {
      if (e) { return handleError(req, res, e) }
    })
}

function getUsers (req, res, next) {
  req.db.collection('users')
    .find({
      'emailValidated': true
    })
    .toArray()
    .then((users) => {
    // log('found %n users %o', users.length, pluck(users, '_id'))
      log('found %o users', users.length)
      req.users = users
      next()
    }).catch((e) => {
      if (e) { return handleError(req, res, e) }
    })
}

// app.get('/stats/forum/:name', restrict, staff, getTopics, function (req, res) {
app.get('/stats/forum/:name', getTopics, getComments, getVotes, getUsers, function (req, res) {
  log('Request /stats/forum/:name with id %o', req.params.name)

  const users = {
    admins: [],
    authors: [],
    collaborators: [],
    participants: [],
    all: []
  }
  if (config.moderatorEnabled) users.moderators = []

  for (let permission of req.forum.permissions) {
    switch (permission.role) {
      case 'admin':
        users.admins.push(permission.user)
        break
      case 'author':
        users.authors.push(permission.user)
        break
      case 'collaborator':
        users.collaborators.push(permission.user)
        break
      case 'participant':
        users.participants.push(permission.user)
        break
      case 'moderator':
        if (config.moderatorEnabled) users.moderators.push(permission.user)
        break
    }
    if (!users.all.includes(permission.user.toString())) users.all.push(permission.user)
  }

  const data = {
    details: pick(req.forum, ['name', 'title', 'summary', 'coverUrl', 'visibility', 'createdAt']),
    topics: {
      all: 0,
      open: 0,
      closing: 0,
      closed: 0,
      authors: []
    },
    comments: {
      all: 0,
      replies: 0,
      ratings: 0,
      flagged: 0,
      authors: [],
      voters: [],
      spamLimit: config.spamLimit
    },
    votes: {
      all: 0,
      poll: 0,
      cause: 0,
      vote: 0,
      authors: [],
      topics: req.topics
    },
    users: {
      admins: users.admins.length,
      authors: users.authors.length,
      collaborators: users.collaborators.length,
      participants: users.participants.length,
      validated: [],
      active: []
    }
  }

  if (config.moderatorEnabled) data.users.moderators = users.moderators.length

  for (var topic of req.topics) {
    if (topic.action.method.length) {
      if (!data.topics[topic.action.method]) { data.topics[topic.action.method] = 0 }
      data.topics[topic.action.method]++
    }
    data.topics.all++
    if (topic.closingAt) {
      if (new Date(topic.closingAt) - Date.now() > 0) {
        data.topics.open++
        data.topics.closing++
      } else {
        data.topics.closed++
      }
    } else {
      data.topics.open++
    }
    let owner = topic.owner.toString()
    if (!data.topics.authors.includes(owner)) { data.topics.authors.push(owner) }
  }

  data.users.active = data.users.active.concat(data.topics.authors)
  data.topics.authors = unique(data.topics.authors).length

  for (var comment of req.comments) {
    data.comments.all++
    if (comment.replies) { data.comments.replies += comment.replies.length }
    if (comment.votes) { data.comments.ratings += comment.votes.length }
    if (comment.flags.length >= data.comments.spamLimit) { data.comments.flagged++ }
    var author = comment.author.toString()
    if (!data.comments.authors.includes(author)) { data.comments.authors.push(author) }
    for (var v of comment.votes) {
      var voter = v.author.toString()
      if (!data.comments.voters.includes(author)) { data.comments.voters.push(voter) }
    }
  }

  data.users.active = data.users.active.concat(data.comments.authors)
  data.users.active = data.users.active.concat(data.comments.voters)
  data.comments.authors = unique(data.comments.authors).length
  data.comments.voters = unique(data.comments.voters).length
  data.comments = omit(data.comments, 'spamLimit')

  for (var vote of req.votes) {
    data.votes.all++
    var t = data.votes.topics.find((e) => {
      return vote.topic.toString() === e._id.toString()
    })
    switch (t.action.method) {
      case 'poll':
        data.votes.poll++
        break
      case 'cause':
        data.votes.cause++
        break
      case 'vote':
        data.votes.vote++
        break
      default:
        data.votes.all-- // if topic has changed, votes are unvalid
    }
    var a = vote.author.toString()
    if (!data.votes.authors.includes(a)) { data.votes.authors.push(a) }
  }

  data.users.active = data.users.active.concat(data.votes.authors)
  data.votes.authors = unique(data.votes.authors).length
  data.votes = omit(data.votes, 'topics')

  data.users.validated = req.users

  data.users.validated = unique(data.users.validated).length
  data.users.active = unique(data.users.active).length
  req.db.close()
  return res.status(200).json(data)
})

function handleError (req, res, e) {
  log('Error on stats request')
  log(e.message)
  if (req.db) req.db.close()
  return res.status(500).json({ error: e.message })
}
