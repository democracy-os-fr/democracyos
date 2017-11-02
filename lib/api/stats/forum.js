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
  mongo.connect(config.mongoUrl, (err, db) => {
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
      if (
        (forum.visibility === 'private') &&
        (
          (!req.user) || // not logged in
          (!req.user.staff) || // not staff
          (forum.owner.toString() !== req.user._id.toString()) || // not owner
          (findIndex(forum.permissions, { user: req.user._id }) >= 0) // not in permissions
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
  .find({ forum: req.forum._id })
  .toArray()
  .then((topics) => {
    log(pluck(topics, '_id'))
    req.topics = topics
    next()
  }).catch((e) => {
    if (e) { return handleError(req, res, e) }
  })
}

// app.get('/stats/forum/:name', restrict, staff, getTopics, function (req, res) {
app.get('/stats/forum/:name', getTopics, function (req, res) {
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

  Promise.all([

    req.db.collection('topics').group([], { '_id': { $in: pluck(req.topics, '_id') } }, data.topics, (o, p) => {
      if (o.action.method.length) {
        if (!p[o.action.method]) { p[o.action.method] = 0 }
        p[o.action.method]++
      }
      p.all++
      if (o.closingAt) {
        if (new Date(o.closingAt) - Date.now() > 0) {
          p.open++
          p.closing++
        } else {
          p.closed++
        }
      } else {
        p.open++
      }
      var owner = o.owner.toString()
      if (!p.authors.includes(owner)) { p.authors.push(owner) }
    }, false).then((result) => {
      data.topics = result[0] ? result[0] : 0
      if (result[0]) {
        data.users.active = data.users.active.concat(result[0].authors)
        result[0].authors = result[0].authors.length
        data.topics = result[0]
      }
      return data.topics
    }),

    req.db.collection('comments').group([], {}, data.comments, (o, p) => {
      p.all++
      if (o.replies) { p.replies += o.replies.length }
      if (o.votes) { p.ratings += o.votes.length }
      if (o.flags.length >= p.spamLimit) { p.flagged++ }
      var author = o.author.toString()
      if (!p.authors.includes(author)) { p.authors.push(author) }
      for (var vote of o.votes) {
        var voter = vote.author.toString()
        if (!p.voters.includes(author)) { p.voters.push(voter) }
      }
    }, false).then((result) => {
      if (result[0]) {
        data.users.active = data.users.active.concat(result[0].authors)
        data.users.active = data.users.active.concat(result[0].voters)
        result[0].authors = result[0].authors.length
        result[0].voters = result[0].voters.length
        data.comments = omit(result[0], 'spamLimit')
      }
      return data.comments
    }),

    req.db.collection('votes').group([], { 'topic': { $in: pluck(req.topics, '_id') } }, data.votes, (o, p) => {
      p.all++
      var topic = p.topics.find((e) => {
        return o.topic.toString() === e._id.toString()
      })
      switch (topic.action.method) {
        case 'poll':
          p.poll++
          break
        case 'cause':
          p.cause++
          break
        case 'vote':
          p.vote++
          break
        default:
          p.all-- // if topic has changed, votes are unvalid
      }
      var author = o.author.toString()
      if (!p.authors.includes(author)) { p.authors.push(author) }
    }, false).then((result) => {
      if (result[0]) {
        data.users.active = data.users.active.concat(result[0].authors)
        result[0].authors = result[0].authors.length
        data.votes = omit(result[0], 'topics')
      }
      return data.votes
    }),

    req.db.collection('users').find({
      '_id': { $in: users.all },
      'emailValidated': true
    }).toArray().then((results) => {
      data.users.validated = results || []
      return data.users
    })

  ]).then((results) => {
    data.users.validated = unique(data.users.validated).length
    data.users.active = unique(data.users.active).length
    req.db.close()
    return res.status(200).json(data)
  }).catch((e) => {
    if (e) { return handleError(req, res, e) }
  })
})

function handleError (req, res, e) {
  log('Error on stats request')
  log(e.message)
  if (req.db) req.db.close()
  return res.status(500).json({ error: e.message })
}
