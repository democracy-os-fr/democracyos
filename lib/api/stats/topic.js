/**
 * Module dependencies.
 */

var express = require('express')
// var mongoose = require('mongoose')
var log = require('debug')('democracyos:api:stats:forum')
var mongo = require('mongodb').MongoClient
var ObjectId = require('mongodb').ObjectID
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

log('loading democracyos:api:stats:topic')

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

app.param('id', (req, res, next, name) => {
  if (isEmpty(req.params.id)) {
    return handleError(req, res, new Error(`missing parameter id : ${req.params.id}`))
  }
  connect(req, res, () => {
    req.db.collection('topics')
    .aggregate([
      {
        $match: { _id: new ObjectId(req.params.id) }
      }, {
        $lookup:
        {
          from: 'forums',
          localField: 'forum',
          foreignField: '_id',
          as: 'forums'
        }
      }
    ])
    .toArray()
    .then((topics) => {
      if (topics.length === 0) {
        return res.status(404).json({ error: `topic not found : ${req.params.id}` })
      } else if (topics.length > 1) {
        return res.status(400).json({ error: `too many topics : ${pluck(topics, '_id')}` })
      } else if (topics[0].forums.length === 0) {
        return res.status(404).json({ error: `forum not found : ${topics[0].forum}` })
      } else if (
        (topics[0].forums[0].visibility === 'private') &&
        (
          (!req.user) || // not logged in
          (!req.user.staff) || // not staff
          (topics[0].forums[0].owner.toString() !== req.user._id.toString()) || // not owner
          (findIndex(topics[0].forums[0].permissions, { user: req.user._id }) >= 0) // not in permissions
        )
      ) {
        return res.status(403).json({ error: 'forum is private' })
      }
      topics[0].forum = topics[0].forums[0]
      req.topic = topics[0]
      next()
    }).catch((e) => {
      if (e) { return handleError(req, res, e) }
    })
  })
})

// app.get('/stats/forum/:id', restrict, staff, getTopics, function (req, res) {
app.get('/stats/topic/:id', function (req, res) {
  log('Request /stats/topic/:id with id %o', req.params.id)

  const topic = req.topic
  const forum = req.topic.forum

  topic.forum = pick(forum, ['name', 'title', 'summary', 'coverUrl', 'visibility', 'createdAt'])

  const data = pick(topic, ['mediaTitle', 'forum', 'coverUrl', 'createdAt', 'publishedAt', 'updatedAt', 'closingAt', 'extra'])
  data.participants = []
  data.comments = {
    all: 0,
    replies: 0,
    ratings: 0,
    flagged: 0,
    authors: [],
    voters: [],
    spamLimit: config.spamLimit
  }

  data.votes = {
    all: 0,
    authors: []
  }

  if (topic.publishedAt) {
    if (topic.closingAt) {
      if (new Date(topic.closingAt) - Date.now() > 0) {
        data.status = 'closing'
      } else {
        data.status = 'closed'
      }
    } else {
      data.status = 'open'
    }
  } else {
    data.status = 'draft'
  }

  Promise.all([

    req.db.collection('comments').group([], {
      context: 'topic',
      reference: req.topic._id.toString()
    }, data.comments, (o, p) => {
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
        data.participants = data.participants.concat(result[0].authors)
        data.participants = data.participants.concat(result[0].voters)
        result[0].authors = result[0].authors.length
        result[0].voters = result[0].voters.length
        data.comments = omit(result[0], 'spamLimit')
      }
      return data.comments
    }),

    req.db.collection('votes').group([], { 'topic': req.topic._id }, data.votes, (o, p) => {
      p.all++
      var author = o.author.toString()
      if (!p.authors.includes(author)) { p.authors.push(author) }
    }, false).then((result) => {
      if (result[0]) {
        data.participants = data.participants.concat(result[0].authors)
        result[0].authors = result[0].authors.length
        data.votes = result[0]
      }
      return data.votes
    })

  ]).then((results) => {
    data.participants = unique(data.participants).length
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
