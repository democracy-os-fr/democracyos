require('lib/models')()
const Comment = require('lib/models').Comment
const dbReady = require('lib/models').ready
const calcStats = require('lib/api-v2/db-api/comments/utils').calcStats

const mapPromises = (fn) => (array) => Promise.all(array.map(fn))

exports.up = function up (done) {
  dbReady()
    .then(() => Comment.collection.find({
      context: 'topic'
    }).toArray())
    .then(mapPromises(function (comment) {
      return Comment.collection.findOneAndUpdate({ _id: comment._id }, { $set: { 'count': calcStats(comment) } })
    }))
    .then(function (results) {
      const total = results.filter((v) => !!v).length
      console.log(`update stats count from ${total} comments succeeded.`)
      done()
    })
    .catch(function (err) {
      console.log('update stats count failed at ', err)
      done(err)
    })
}

exports.down = function down (done) {
  done()
}
