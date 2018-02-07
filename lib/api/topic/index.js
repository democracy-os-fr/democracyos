let debug = require('debug')
let express = require('express')
let notifier = require('democracyos-notifier')
let api = require('lib/db-api')
let utils = require('lib/utils')
let accepts = require('lib/accepts')
let config = require('lib/config')
let urlBuilder = require('lib/url-builder')
let forumMiddlewares = require('lib/middlewares/forum-middlewares')
let forumMiddlewaresV2 = require('lib/api-v2/middlewares/forums')
let topicMiddlewaresV2 = require('lib/api-v2/middlewares/topics')
let privileges = require('lib/privileges/topic')
const userScopes = require('lib/api-v2/db-api/users/scopes')
const { votedBy } = require('lib/api-v2/db-api/topics/utils')

let restrict = utils.restrict
let expose = utils.expose

let log = debug('democracyos:topic')

let app = module.exports = express()

/**
 * Limit request to json format only
 */

app.use(accepts('application/json'))

let topicListKeys = module.exports.topicListKeys = [
  'id',
  'topicId',
  'title',
  'mediaTitle',
  'status',
  'open',
  'closed',
  'public',
  'draft',
  'deleted',
  'forum',
  'tag',
  'tags',
  'participants',
  'action',
  'createdAt',
  'updatedAt',
  'closingAt',
  'coverUrl',
  'publishedAt',
  'deletedAt',
  'author',
  'authorUrl'
]

let topicKeys = module.exports.topicKeys = topicListKeys.concat([
  'summary',
  'clauses',
  'source',
  'state',
  'upvotes',
  'downvotes',
  'abstentions',
  'links'
])

const exposeTopic = (topicDoc, user, keys) => votedBy(user, topicDoc)
  .then((voted) => {
    if (!keys) keys = topicKeys

    const topic = topicDoc.toJSON()
    topic.voted = voted

    if (topicDoc.populated('participants')) {
      topic.participants = topic.participants.map(userScopes.ordinary.expose)
    }

    return expose(keys)(topic)
  })

app.param('id', function (req, res, next, id) {
  api.topic.searchOne(id, function (err, topic) {
    if (err) {
      log('Error fetching topic: %s', err)
      return next()
    }

    if (!topic) return res.status(404).send()

    req.topic = topic

    if (!topic.forum) return next()

    api.forum.findById(topic.forum, function (_err, forum) {
      if (_err || !forum) return _handleError(_err, req, res)
      req.forum = forum
      next()
    })
  })
})

app.post('/topic/:id/publish',
  restrict,
  forumMiddlewares.privileges('canPublishTopics'),
  topicMiddlewaresV2.findById,
  forumMiddlewaresV2.findFromTopic,
  function (req, res, next) {
    log('Request POST /topic/%s/publish', req.params.id)

    api.topic.get(req.params.id, function (err, topic) {
      if (err) return _handleError(err, req, res)

      topic.publishedAt = new Date()
      topic.save(function (err, saved) {
        if (err) return _handleError(err, req, res)
        log('publish topic %s at %s', topic.id, topic.publishedAt)

        let eventName = 'topic-published'

        let topicUrl = utils.buildUrl(config, {
          pathname: urlBuilder.for('site.topic', {
            forum: req.forum.name,
            id: topic.id
          })
        })

        let data = {
          topic: { mediaTitle: topic.mediaTitle, id: topic.id },
          url: topicUrl
        }

        if (!config.multiForum) {
          notifier.now(eventName, data).then(() => {
            log('Successfully notified publishing of topic %s', topic.id)
          })
            .catch((err) => {
              log('Error when sending notification for event %s', eventName)
              return _handleError(err, req, res)
            })
        }
      })

      exposeTopic(topic, req.user).then((json) => {
        if (req.user) {
          json.privileges = privileges.all(req.forum, req.user, topic)
        } else {
          json.privileges = {}
        }

        res.status(200).json(json)
      }).catch(next)
    })
  })

app.post('/topic/:id/unpublish',
  restrict,
  forumMiddlewares.privileges('canPublishTopics'),
  function (req, res, next) {
    log('Request POST /topic/%s/unpublish', req.params.id)

    api.topic.get(req.params.id, function (err, topicDoc) {
      if (err) return _handleError(err, req, res)

      topicDoc.publishedAt = null
      topicDoc.save(function (err, saved) {
        if (err) return _handleError(err, req, res)
        log('unpublished topic %s', topicDoc.id)

        exposeTopic(topicDoc, req.user).then((json) => {
          if (req.user) {
            json.privileges = privileges.all(req.forum, req.user, topicDoc)
          } else {
            json.privileges = {}
          }

          res.status(200).json(json)
        }).catch(next)
      })
    })
  })

function _handleError (err, req, res) {
  log('Error found: %s', err)
  let error = err
  if (err.errors && err.errors.text) error = err.errors.text
  if (error.type) error = error.type

  res.status(400).json({ error: error })
}
