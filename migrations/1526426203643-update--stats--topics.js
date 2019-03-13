require('lib/models')()
const Topic = require('lib/models').Topic
const dbReady = require('lib/models').ready
const calcStats = require('lib/api-v2/db-api/topics/utils').calcStats

const mapPromises = (fn) => (array) => Promise.all(array.map(fn))

exports.up = function up (done) {
  dbReady()
    .then(() => Topic.collection.find({}).toArray())
    .then(mapPromises(function (topic) {
      return calcStats(topic)
        .then((results) => {
          return Topic.collection.findOneAndUpdate({ _id: topic._id }, { $set: { 'count': results } })
        })
    }))
    .then(function (results) {
      const total = results.filter((v) => !!v).length
      console.log(`update stats count from ${total} topics succeeded.`)
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
