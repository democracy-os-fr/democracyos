require('lib/models')()

const User = require('lib/models').User
const dbReady = require('lib/models').ready

const mapPromises = (fn) => (array) => Promise.all(array.map(fn))

/**
 * Make any changes you need to make to the database here
 */
exports.up = function up (done) {
  dbReady()
    .then(() => User.collection.find({
      $or: [
        { username: { $exists: false } },
        { username: { $eq: '' } },
        { username: { $type: 10 } }
      ]
    }).toArray())
    .then(mapPromises(function (user) {
      const username = user.firstName + ' ' + user.lastName
      return User.findOneAndUpdate({ _id: user._id }, { $set: { username: username } })
    }))
    .then(function (users) {
      const total = users.filter((v) => !!v).length
      console.log(`update username from ${total} users succeded.`)
      done()
    })
    .catch(function (err) {
      console.log('update username failed at ', err)
      done(err)
    })
}

/**
 * Make any changes that UNDO the up function side effects here (if possible)
 */
exports.down = function down (done) {
  done()
}
