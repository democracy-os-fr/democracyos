var t = require('t-component')
var Log = require('debug')
var Batch = require('batch')
var models = require('lib/models')
var config = require('lib/config')
var pluck = require('lib/utils').pluck
var log = new Log('democracyos:db-api:forum')
var Forum = models.Forum
var copyTopics = require('lib/api-v2/db-api/topics').copy
var copyWhitelists = require('lib/db-api/whitelist').copy

exports.all = function all (options, fn) {
  if (typeof options === 'function') {
    fn = options
    options = undefined
  }

  log('Looking for all forums.')
  // log(options)
  var query = Forum
    .find({ deletedAt: null })
    .populate('owner')
    .sort('-createdAt')

  if (options) {
    if (options.limit) query.limit(options.limit)
    if (options.skip) query.skip(options.skip)
    if (options.owner) query.find({ owner: options.owner })

    if (options['privileges.canChangeTopics']) {
      let user = options['privileges.canChangeTopics']._id || options['privileges.canChangeTopics']
      query.find({
        $or: [
          { owner: user },
          {
            permissions: {
              $elemMatch: {
                user: user,
                role: { $in: ['admin', 'collaborator', 'author'] }
              }
            }
          }
        ]
      })
    }

    if (options['privileges.canView']) {
      let user = options['privileges.canView']._id || options['privileges.canView']
      query.find({
        $or: [
          { owner: user },
          {
            permissions: {
              $elemMatch: { user: user }
            }
          },
          { visibility: { $ne: 'private' } }
        ]
      })
    }
  }

  if (!options || (!options.staff && !options.owner && !options['privileges.canChangeTopics'] && !options['privileges.canView'])) {
    log('filter private')
    log(options)
    query.find({ visibility: { $ne: 'private' } })
  }

  query.exec(function (err, forums) {
    if (err) {
      log('Found error %j', err)
      return fn(err)
    }

    log('Delivering forums %j', pluck(forums, 'id'))
    fn(null, forums)
  })

  return this
}

exports.create = function create (data, fn) {
  log('Creating new forum.')
  data.topicsAttrs = addTopicsAttrs(data)
  var forum = new Forum(data)
  forum.save(onsave)

  function onsave (err) {
    if (err) {
      log('Found error: %s', err)
      return fn(err)
    }

    log('Saved forum with id %s', forum.id)
    fn(null, forum)
  }
}

exports.update = function update (forum, data, fn) {
  data.topicsAttrs = addTopicsAttrs(data)
  forum.set(data)
  return forum.save(fn)
}

exports.del = function del (forum, fn) {
  log('Deleting forum %s', forum.name)
  forum.delete(function (err) {
    if (err) log('Found error: %s', err)
    return fn(err)
  })
}

exports.copy = function copy (data, fn) {
  log('Creating new forum copy.')
  data.topicsAttrs = addTopicsAttrs(data)
  var forum = new Forum(data)

  this.copyPermissions(data.source, forum)
  .then(function (_forum) {
    forum = _forum
  })
  .catch(function (err) {
    log('Found error: %s', err)
    return fn(err)
  })

  forum.save(onsave)

  function onsave (err) {
    if (err) {
      log('Found error: %s', err)
      return fn(err)
    }

    copyWhitelists(data.source, forum.id, function (whitelists) {
      copyTopics({ source: data.source, forum })
      .then(function (topics) {
        if (err) {
          log('Found error: %s', err)
          return fn(err)
        }

        log('Saved forum with id %s and topics %j', forum.id, pluck(topics, 'id'))
        fn(null, forum)
      })
      .catch(function (err) {
        log('Found error: %s', err)
        return fn(err)
      })
    })
  }
}

exports.findOneByOwner = function findOneByOwner (owner, fn) {
  log('Searching forum of owner %j', owner)

  Forum
    .where({ owner: owner, deletedAt: null })
    .populate('owner')
    .findOne(function (err, forum) {
      if (err) {
        log('Found error: %j', err)
        return fn(err)
      }

      if (forum) log("Found forum '%s' of %j", forum.name, owner)
      else log('Not Found forum of %j', owner)

      fn(null, forum)
    })

  return this
}

exports.findByOwner = function findByOwner (owner, fn) {
  log('Searching forums of owner %j', owner)

  Forum
    .where({ owner: owner, deletedAt: null })
    .populate('owner')
    .find(function (err, forums) {
      if (err) {
        log('Found error: %j', err)
        return fn(err)
      }

      fn(null, forums)
    })

  return this
}

exports.findById = function findById (id, fn) {
  log('Searching for forum with id %s', id)

  Forum
    .where({ deletedAt: null, _id: id })
    .populate('owner')
    .findOne(function (err, forum) {
      if (err) {
        log('Found error: %j', err)
        return fn(err)
      } else if (!forum) {
        log('No forum found with id %s', id)
        return fn()
      }

      log('Found forum %s', forum.id)
      fn(null, forum)
    })

  return this
}

exports.findOneByName = function findOneByName (name, fn) {
  log('Searching for forum with name %s', name)

  var query = { deletedAt: null }

  if (name) query.name = name

  Forum
    .where(query)
    .populate('owner')
    .findOne(function (err, forum) {
      if (err) {
        log('Found error: %j', err)
        return fn(err)
      } else if (!forum) {
        log('No forum found with name %s', name)
        return fn()
      }

      log('Forum coverurl %s', forum.coverUrl)
      log('Found forum %s', forum.name)
      fn(null, forum)
    })

  return this
}

exports.nameIsValid = function nameIsValid (name) {
  return Forum.nameIsValid(name)
}

exports.getPermissions = function getPermissions (id, fn) {
  log('Searching for permissions of forum with id %s', id)

  Forum
    .where({ deletedAt: null, _id: id })
    .select('permissions')
    .populate('permissions.user')
    .findOne((err, forum) => {
      return fn(err, forum.permissions.toObject())
    })
}

exports.grantPermission = function grantPermission (forumId, user, role) {
  log('Granting permissions as role %s to user %s of forum with id %s', role, user, forumId)
  return new Promise((resolve, reject) => {
    Forum.findById(forumId, (findError, forum) => {
      if (findError) return reject(findError)

      forum.grantPermission(user, role, (saveError) => {
        if (saveError) return reject(saveError)
        return resolve(forum)
      })
    })
  })
}

exports.revokePermission = function revokePermission (forumId, user, role) {
  log(`Revoking permissions to ${user} on forum ${forumId}.`)

  return new Promise((resolve, reject) => {
    Forum.findById(forumId, (findError, forum) => {
      if (findError) return reject(findError)
      forum.revokePermission(user, role, (revokeError) => {
        if (revokeError) return reject(revokeError)
        log(`Permissions revoked to ${user} on forum ${forumId}.`)
        return resolve(forum)
      })
    })
  })
}

exports.copyPermissions = function copyPermissions (source, forum) {
  log('Duplicating permissions of forum with id %s', source)
  return new Promise((resolve, reject) => {
    Forum
      .where({ _id: source })
      .select('permissions')
      .findOne((err, _forum) => {
        if (err) return reject(err)
        forum.permissions = _forum.permissions
        return resolve(forum)
      })
  })
}

exports.exists = function exists (name, fn) {
  name = normalize(name)
  Forum
    .find({ deletedAt: null, name: name })
    .limit(1)
    .exec(function (err, forum) {
      return fn(err, !!(forum && forum.length))
    })
}

function normalize (str) {
  return str.trim().toLowerCase()
}

function addTopicsAttrs (data) {
  var attrs = []

  if (data.topicsAttrs) {
    data = data.topicsAttrs
  }

  if (data.disableComments) {
    attrs.push({
      'name': 'disableComments',
      'title': t('admin-topics-form.topicsAttrs.disableComments'),
      'kind': 'Boolean'
    })
  }

  if (data.commentsLength) {
    attrs.push({
      'name': 'commentsLength',
      'title': t('admin-topics-form.topicsAttrs.commentsLength'),
      'kind': 'Number',
      'min': 140,
      'max': config.maxCommentsLength,
      'defaultValue': config.defaultCommentsLength
    })
  }

  if (data.hideResultsBeforeClosing) {
    attrs.push({
      'name': 'hideResultsBeforeClosing',
      'title': t('admin-topics-form.topicsAttrs.hideResultsBeforeClosing'),
      'kind': 'Boolean'
    })
  }

  if (data.nextTopic) {
    attrs.push({
      'name': 'nextTopic',
      'title': t('admin-topics-form.topicsAttrs.nextTopic'),
      'kind': 'String',
      'min': 10,
      'max': 256,
      'description': t('admin-topics-form.topicsAttrs.nextTopic.description')
    })

    attrs.push({
      'name': 'nextTopicLabel',
      'title': t('admin-topics-form.topicsAttrs.nextTopicLabel'),
      'kind': 'String',
      'min': 0,
      'max': 1024,
      'defaultValue': t('proposal-article.next')
    })
  }

  return attrs
}
