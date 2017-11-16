'use strict'
const log = require('debug')('democracyos:migrations')
const mongo = require('mongodb').MongoClient
const config = require('lib/config')

const mapPromises = (fn) => (array) => Promise.all(array.map(fn))

function handleError (e, db) {
  log('Error on stats request')
  log(e.message)
  if (db) db.close()
}

/**
 * Make any changes you need to make to the database here
 */

exports.up = function up (done) {
  if (config.extra.user.org || config.extra.user.age || config.extra.user.job || config.extra.user.postal) {
    mongo.connect(config.mongoUrl, (err, db) => {
      if (err) { return handleError(err, db) }
      log('connected to %s', config.mongoUrl)

      db.collection('rules').find({
        type: 'location'
      }, {
        _id: 0,
        name: 1,
        'value.label.default': 1
      }).toArray()
      .then((results) => {
        const locations = {}
        let i = 1
        for (var location of results) {
          locations[location.name] = {
            index: i,
            key: location.name,
            value: location.value.label.default
          }
          log(`"user.extra.age.custom.${i}": "${location.value.label.default}"`)
          i++
        }

        db.collection('users').find({
          location: { $exists: true }
        }, {
          _id: 1,
          location: 1
        }).toArray()
        .then(mapPromises((user) => {
          var set = { extra: {} }
          var doUpdate = false

          if (config.extra.user.age && locations[user.location]) {
            set.extra.age = locations[user.location].index
            doUpdate = true
          }

          return doUpdate ? db.collection('users').updateOne({ _id: user._id }, { $set: set }) : 0
        }))
        .then(function (results) {
          const total = results.filter((v) => v !== 0).length
          console.log(`update extras from ${total} users succeeded.`)
          db.close()
          done()
        })
        .catch(function (err) {
          console.log('User extras update failed at ', err)
          db.close()
          done(err)
        })
      })
      .catch(function (err) {
        console.log('User extras update failed at ', err)
        db.close()
        done(err)
      })
    })
  } else {
    console.log('Nothing to update')
    done()
  }
}

/**
 * Make any changes that UNDO the up function side effects here (if possible)
 */
exports.down = function down (done) {
  done()
}
