require('lib/models')()
const ObjectID = require('mongodb').ObjectID
const Topic = require('lib/models').Topic
const Vote = require('lib/models').Vote
const dbReady = require('lib/models').ready
const calcResult = require('lib/api-v2/db-api/topics/utils').calcResult

const mapPromises = (fn) => (array) => Promise.all(array.map(fn))

exports.up = function up (done) {
  dbReady()
    .then(() => Topic.collection.find({
      'action.method': { $ne: '' }
    }).toArray())
    .then(mapPromises(function (topic) {
      return calcResult(topic)
        .then((results) => {
          // const closed = topic.closingAt && topic.closingAt.getTime() < Date.now()
          const action = {
            count: results.count,
            results: results.results,
            method: topic.action.method
          }
          // console.log(topic.mediaTitle)
          // console.log('closed %o', closed)
          // console.log(action)
          return Topic.collection.findOneAndUpdate({ _id: topic._id }, { $set: { 'action': action } })
        })
    }))
    .then(function (results) {
      const total = results.filter((v) => !!v).length
      console.log(`update votes count from ${total} topics succeded.`)
      done()
    })
    .catch(function (err) {
      console.log('update votes count failed at ', err)
      done(err)
    })
}

exports.down = function down (done) {
  done()
}
