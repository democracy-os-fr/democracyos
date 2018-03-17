require('lib/models')()
const Topic = require('lib/models').Topic
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
          const action = {
            count: results.count,
            results: results.results,
            method: topic.action.method,
            multiple: topic.action.multiple || false
          }
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
