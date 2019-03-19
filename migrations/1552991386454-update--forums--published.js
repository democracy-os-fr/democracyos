require('lib/models')()
const Forum = require('lib/models').Forum
const dbReady = require('lib/models').ready

const mapPromises = (fn) => (array) => Promise.all(array.map(fn))

exports.up = function up (done) {
  dbReady()
    .then(() => Forum.collection.find({ publishedAt: { $exists: false } }).toArray())
    .then(mapPromises(function (forum) {
      return Forum.collection.findOneAndUpdate({ _id: forum._id }, { $set: { 'publishedAt': Date.now() } })
    }))
    .then(function (results) {
      const total = results.filter((v) => !!v).length
      console.log(`Update publishedAt of ${total} forum(s) succeeded.`)
      done()
    })
    .catch(function (err) {
      console.log('Update publishedAt failed at ', err)
      done(err)
    })
}

exports.down = function down (done) {
  done()
}
