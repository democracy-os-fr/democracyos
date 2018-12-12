/**
 * Module dependencies.
 */

var express = require('express')
// var mongoose = require('mongoose')
var log = require('debug')('democracyos:api:stats')
var mongo = require('mongodb').MongoClient
var accepts = require('lib/accepts')
// var api = require('lib/db-api')
// var utils = require('lib/utils')
// var restrict = utils.restrict
// var staff = utils.staff
var config = require('lib/config')
var app = module.exports = express()

/**
 * Limit request to json format only
 */
app.use(accepts(['application/json', 'text/html']))

// app.get('/stats', restrict, staff, function (req, res) {
app.get('/stats', function (req, res) {
  log('Request /stats')
  var data = {
    users: {}
  }

  mongo.connect(config.mongoUrl, { useNewUrlParser: true }, function (err, client) {
    const db = client.db()
    if (err) {
      log('Error on mongo connect to %s', config.mongoUrl)
      console.error(err)
      return res.status(500).json({ error: err })
    }

    log('connected to %s', config.mongoUrl)

    Promise.all([

      db.collection('comments').find().toArray().then((result) => {
        data.comments = result.length
        return data.comments
      }),

      db.collection('votes').find().toArray().then((result) => {
        data.votes = result.length
        return data.votes
      }),

      db.collection('comments').aggregate({
        $unwind: '$votes'
      }, {
        $group: {
          _id: '#votes',
          total: {
            $sum: 1
          }
        }
      }).toArray().then((result) => {
        data.ratings = result[0]
          ? result[0].total
          : 0
        return data.ratings
      }),

      db.collection('comments').aggregate({
        $unwind: '$replies'
      }, {
        $group: {
          _id: '#replies',
          total: {
            $sum: 1
          }
        }
      }).toArray().then((result) => {
        data.replies = result[0]
          ? result[0].total
          : 0
        return data.replies
      }),

      db.collection('users').group([], {}, {
        all: 0,
        validated: 0
      }, (o, p) => {
        if (o.emailValidated) { p.validated++ }
        p.all++
      }, false).then((result) => {
        data.users = result[0] ? result[0] : 0
        return data.users
      }),

      db.collection('topics').group([], {}, {
        all: 0
      }, (o, p) => {
        if (o.action.method.length) {
          if (!p[o.action.method]) { p[o.action.method] = 0 }
          p[o.action.method]++
        }
        p.all++
      }, false).then((result) => {
        data.topics = result[0] ? result[0] : 0
        return data.topics
      })

    ]).then((results) => {
      client.close()
      return res.status(200).json(data)
    }).catch((e) => {
      if (e) {
        log('Error on stats request')
        console.error(err)
        return res.status(500).json({ error: e })
      }
    })
  })
})

app.use(require('./forum.js'))
app.use(require('./topic.js'))
