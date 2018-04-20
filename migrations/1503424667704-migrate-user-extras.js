'use strict'
const User = require('lib/models').User
const dbReady = require('lib/models').ready
const config = require('lib/config')

const mapPromises = (fn) => (array) => Promise.all(array.map(fn))

/**
 * Make any changes you need to make to the database here
 */

exports.up = function up (done) {
  if (config.extra.user.org || config.extra.user.age || config.extra.user.job || config.extra.user.postal) {
    dbReady()
      .then(() => User.collection.find({}).toArray())
      .then(mapPromises((user) => {
        var set = { extra: {} }
        var doUpdate = false

        if (config.extra.user.age && user.age) {
          set.extra.age = user.age
          doUpdate = true
        }

        if (config.extra.user.org && user.custom) {
          set.extra.org = user.custom
          doUpdate = true
        }

        return doUpdate ? User.collection.findOneAndUpdate({ _id: user._id }, { $set: set }) : 0
      }))
      .then(function (results) {
        const total = results.filter((v) => !!v).length
        console.log(`update extras from ${total} users succeeded.`)
        done()
      })
      .catch(function (err) {
        console.log('User extras update failed at ', err)
        done(err)
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
