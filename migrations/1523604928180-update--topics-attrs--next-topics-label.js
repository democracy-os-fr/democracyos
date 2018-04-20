require('lib/models')()

const t = require('t-component')
const find = require('mout/array/find')
const has = require('mout/object/has')
const pluck = require('mout/array/pluck')
const Forum = require('lib/models').Forum
const Topic = require('lib/models').Topic
const dbReady = require('lib/models').ready

const mapPromises = (fn) => (array) => Promise.all(array.map(fn))

exports.up = function up (done) {
  dbReady()
    .then(() => Forum.collection.find({ 'topicsAttrs.name': 'nextTopic' })
      .toArray()
      .then(mapPromises(function (forum) {
        if (!find(forum.topicsAttrs, { name: 'nextTopicLabel' })) {
          forum.topicsAttrs.push({
            'name': 'nextTopicLabel',
            'title': t('admin-topics-form.topicsAttrs.nextTopicLabel'),
            'kind': 'String',
            'min': 10,
            'max': 1024,
            'defaultValue': t('proposal-article.next')
          })
          return Forum.collection.findOneAndUpdate({ _id: forum._id }, {
            $set: {
              topicsAttrs: forum.topicsAttrs
            }
          })
        } else {
          return false
        }
      }))
      .then(function (results) {
        const forums = results.filter((v) => !!v)
        console.log(`update topics attrs nextTopicLabel from ${forums.length} forums succeeded.`)
        return pluck(pluck(forums, 'value'), '_id')
      })
      .then((forums) => Topic.collection.find({
        'forum': { $in: forums },
        'attrs.nextTopic': { $exists: true }
      })
        .toArray()
        .then(mapPromises(function (topic) {
          if (!has(topic, 'attrs.nextTopicLabel')) {
            return Topic.collection.findOneAndUpdate({ _id: topic._id }, {
              $set: {
                'attrs.nextTopicLabel': t('proposal-article.next')
              }
            })
          } else {
            return false
          }
        }))
      )
    )
    .then(function (results) {
      const total = results.filter((v) => !!v).length
      console.log(`update topics attrs nextTopicLabel from ${total} topics succeeded.`)
      done()
    })
    .catch(function (err) {
      console.log('update topics attrs nextTopicLabel failed at ', err)
      done(err)
    })
}

exports.down = function down (done) {
  console.log('update topics attrs nextTopicLabel has no down migration')
  done()
}
