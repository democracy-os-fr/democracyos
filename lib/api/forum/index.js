var ObjectId = require('mongoose').Types.ObjectId
var express = require('express')
var Log = require('debug')
var config = require('lib/config')
var api = require('lib/db-api')
var utils = require('lib/utils')
var restrict = utils.restrict
var maintenance = utils.maintenance
var expose = utils.expose
var privileges = require('lib/privileges/forum')
var middlewares = require('lib/middlewares/forum-middlewares')
var generator = require('lib/generator')

var log = new Log('democracyos:forum-api')

var app = module.exports = express()
function getUserKeys (scope) {
  scope = scope ? scope + '.' : ''
  return '%id %fullName %displayName %avatar %locale'.replace(/%/g, scope)
}

var ownerKeys = getUserKeys('owner')

var keys = ['id',
  'name',
  'title',
  'summary',
  'visibility',
  'createdAt',
  'coverUrl',
  'topicsAttrs',
  'initialTags',
  'extra',
  ownerKeys
].join(' ')

var permissionsKeys = ['role', getUserKeys('user')].join(' ')

app.get('/forum/all', function (req, res) {
  var page = parseInt(req.query.page, 10) || 0
  var limit = 20

  var options = {
    limit: limit,
    skip: page * limit,
    owner: req.query.owner
  }

  if (req.query.staff) {
    options.staff = req.query.staff
  }

  if (req.query['privileges.canChangeTopics']) {
    if (!req.user) return res.status(400).send()
    options['privileges.canChangeTopics'] = req.user
  }

  if (req.query['privileges.canView']) {
    // if (!req.user) return res.status(400).send()
    options['privileges.canView'] = req.user
  }

  api.forum.all(options, function (err, forums) {
    if (err) return _handleError(err, req, res)
    res.status(200).json(forums.map((forum) => {
      var json = expose(keys)(forum)
      json.privileges = req.user ? privileges.all(forum, req.user) : {}
      return json
    }))
  })
})

app.get('/forum/exists', function (req, res, next) {
  if (!api.forum.nameIsValid(req.query.name)) {
    return res.status(200).json({ exists: true })
  }

  api.forum.exists(req.query.name, function (err, exists) {
    if (err) return next(err)
    return res.status(200).json({ exists: exists })
  })
})

app.get('/forum/mine', restrict, function (req, res) {
  if (!req.user) return res.status(404).send()

  api.forum.findByOwner(req.user.id, function (err, forums) {
    if (err) return _handleError(err, req, res)

    if (forums) {
      return res.status(200).json(forums.map(expose(keys)))
    } else {
      return res.status(404).send()
    }
  })
})

function respondForum (req, res) {
  var forum = expose(keys)(req.forum)
  if (req.user) {
    forum.privileges = privileges.all(req.forum, req.user)
  } else {
    forum.privileges = {}
  }
  return res.status(200).json(forum)
}

app.get('/forum',
  middlewares.findForumByName,
  middlewares.privileges('canView'),
  respondForum
)

app.get('/forum/:id',
  middlewares.findForum,
  middlewares.privileges('canView'),
  respondForum
)

app.get('/forum/:id/permissions',
  restrict,
  middlewares.findForum,
  middlewares.privileges('canEdit'),
  function (req, res) {
    if (!ObjectId.isValid(req.params.id)) {
      return _handleError(new Error('Invalid :id'), req, res)
    }

    api.forum.getPermissions(req.params.id, function (err, permissions) {
      if (err) return _handleError(err, req, res)
      res.status(200).json(permissions.map(expose(permissionsKeys))).send()
    })
  }
)

app.post('/forum/:id/permissions',
  restrict,
  maintenance,
  middlewares.findForum,
  middlewares.privileges('canEdit'),
  function (req, res) {
    api.forum.grantPermission(req.params.id, req.body.user, req.body.role)
      .then(() => res.status(200).send())
      .catch((err) => {
        log('Found error: ', err)
        res.status(500).send()
      })
  }
)

app.delete('/forum/:id/permissions',
  restrict,
  maintenance,
  middlewares.findForum,
  middlewares.privileges('canEdit'),
  function (req, res) {
    api.forum.revokePermission(req.params.id, req.body.user, req.body.role)
      .then(() => res.status(200).send())
      .catch((err) => {
        log('Found error: ', err)
        res.status(500).send()
      })
  }
)

app.post('/forum', middlewares.canCreateForum, restrict, maintenance, function (req, res) {
  var data = {
    name: req.body.name,
    title: req.body.title,
    owner: req.user._id,
    body: req.body.body,
    summary: req.body.summary,
    coverUrl: req.body.cover,
    permissions: req.body.permissions
  }

  _manageTopicsAttrs(req, data)

  log('Trying to create forum with name: %s', data.name)

  api.forum.create(data, function (err, forum) {
    if (err) return _handleError(err, req, res)
    log('Forum document created successfully: %s', forum.name)

    // Adopt orphan topics
    if (!config.multiForum) {
      log('Searching for old topics without forum')
      api.topic.all({ forum: null }, function (err, topics) {
        if (err) {
          log('Error fetching all orphan topics: %s', err)
          return
        }

        if (!topics.length) return

        topics.forEach(function (topic) {
          topic.forum = forum
          topic.save(function (err) {
            if (err) {
              log('There was an error when trying to un-orphanate topic with id: %s', topic._id, err)
            } else {
              log('Un-orphanated topic with id: %s', topic._id)
            }
          })
        })
      })
    }

    return res.status(200).json(expose(keys)(forum))
  })
})

app.post('/forum/generate', middlewares.canCreateForum, restrict, function (req, res) {
  var data = {
    name: generator.words(1),
    title: generator.words(2).join(' '),
    owner: req.user._id,
    body: generator.words(4),
    summary: generator.words(4).join('-'),
    coverUrl: '',
    permissions: []
  }

  log('Trying to create forum with name: %s', data.name)

  api.forum.create(data, function (err, forum) {
    if (err) return _handleError(err, req, res)
    log('Forum document created successfully: %s', forum.name)

    return res.json(200, expose(keys)(forum))
  })
})

app.post('/forum/copy', middlewares.canCreateForum, restrict, maintenance, function (req, res) {
  var data = {
    source: req.body.source,
    name: req.body.name,
    title: req.body.title,
    owner: req.user._id,
    body: req.body.body,
    summary: req.body.summary,
    coverUrl: req.body.cover,
    permissions: req.body.permissions
  }

  _manageTopicsAttrs(req, data)

  log('Trying to duplicate forum %s with name: %s', data.source, data.name)

  api.forum.copy(data, function (err, forum) {
    if (err) return _handleError(err, req, res)
    log('Forum document created successfully: %s', forum.name)

    return res.status(200).json(expose(keys)(forum))
  })
})

app.post('/forum/:id',
  restrict,
  middlewares.findForum,
  middlewares.privileges('canEdit'),
  function (req, res) {
    _manageTopicsAttrs(req, req.body)
    api.forum.update(req.forum, req.body, function (err, forum) {
      if (err) return _handleError(err, req, res)
      log('Forum updated successfully')
      return res.json(200, expose(keys)(forum))
    })
  }
)

app.put('/forum/:id',
  restrict,
  maintenance,
  middlewares.findForum,
  middlewares.privileges('canEdit'),
  function (req, res) {
    if (!req.body.data) return res.status(400).send()
    if (typeof req.body.data !== 'object') return res.status(400).send()

    _manageTopicsAttrs(req, req.body.data)

    api.forum.update(req.forum, req.body.data, function (err, forum) {
      if (err) return _handleError(err, req, res)
      log('Forum updated successfully')
      return res.status(200).json(expose(keys)(forum))
    })
  }
)

app.delete('/forum/:id',
  restrict,
  maintenance,
  middlewares.findForum,
  middlewares.privileges('canDelete'),
  function (req, res) {
    var forum = req.forum

    log('Trying to delete forum: %s', forum.id)

    api.forum.del(forum, function (err) {
      if (err) return res.status(500).json(err)
      res.status(200).send()
    })
  }
)

/**
 * Helper functions
 */

function _handleError (err, req, res) {
  log('Error found: %s', err)
  var error = err
  if (err.errors && err.errors.text) error = err.errors.text
  if (error.type) error = error.type

  res.status(400).json({ error: error })
}

function _manageTopicsAttrs (req, data) {
  data.topicsAttrs = {}

  if (req.body.disableComments) {
    data.topicsAttrs.disableComments = req.body.disableComments
  }

  if (req.body.commentsLength) {
    data.topicsAttrs.commentsLength = req.body.commentsLength
  }

  if (req.body.hideResultsBeforeClosing) {
    data.topicsAttrs.hideResultsBeforeClosing = req.body.hideResultsBeforeClosing
  }

  if (req.body.nextTopic) {
    data.topicsAttrs.nextTopic = req.body.nextTopic
  }
}
