var Batch = require('batch')
var log = require('debug')('democracyos:db-api:whitelist')
var ObjectID = require('mongoose').Types.ObjectId
var Whitelist = require('lib/models').Whitelist
var utils = require('lib/utils')
var pluck = utils.pluck

/**
 * Get all whitelist
 *
 * @param {Function} fn callback function
 *   - 'err' error found on query or `null`
 *   - 'whitelist' list whitelists found or `undefined`
 * @return {Module} `whitelist` module
 * @api public
 */

exports.all = function all (fn) {
  log('Looking for all whitelists')

  Whitelist
    .find({})
    .populate('forum')
    .exec(function (err, whitelist) {
      if (err) {
        log('Found error %j', err)
        return fn(err)
      }

      log('Delivering whitelist %o', whitelist.map(function (item) { return (item.forum ? item.forum.name : '*') + ' - ' + item.value }))
      fn(null, whitelist)
    })

  return this
}

/**
 * Get Whitelist form `id` string or `ObjectId`
 *
 * @param {String|ObjectId} id Whitelist's `id`
 * @param {Function} fn callback function
 *   - 'err' error found while process or `null`
 *   - 'whitelist' found item or `undefined`
 * @api public
 */

exports.get = function get (id, fn) {
  log('Looking for whitelist %s', id)
  Whitelist
    .findById(id)
    .populate('forum')
    .exec(function (err, whitelist) {
      if (err) {
        log('Found error %s', err)
        return fn(err)
      }

      if (!whitelist) {
        log('Whitelist %s not found', id)
        return fn(null)
      }
      log('Delivering whitelist %s', whitelist.id)
      fn(null, whitelist)
    })
}

/**
 * Search whitelists from query
 *
 * @param {Object} query filter
 * @param {Function} fn callback function
 *   - 'err' error found while process or `null`
 *   - 'whitelists' list of whitelists objects found or `undefined`
 * @return {Module} `whitelist` module
 * @api public
 */

exports.search = function search (query, fn) {
  log('Searching for whitelists matching %j', query)

  Whitelist
    .find(query)
    .populate('forum')
    .exec(function (err, whitelists) {
      if (err) {
        log('Found error: %j', err)
        return fn(err)
      }

      log('Delivering whitelist %o', whitelists.map(function (item) { return (item.forum ? item.forum.name : '*') + ' - ' + item.value }))
      fn(null, whitelists)
    })

  return this
}

/**
 * Creates whitelist
 *
 * @param {Object} data to create whitelist
 * @param {Function} fn callback function
 *   - 'err' error found on query or `null`
 *   - 'whitelist' whitelist created or `undefined`
 * @return {Module} `whitelist` module
 * @api public
 */

exports.create = function create (data, fn) {
  log('Creating new whitelist %j', data)

  if (['email', 'domain'].includes(data.type)) {
    var batch = new Batch()
    var values = data.value.split(',')
    values.forEach(function (value) {
      if (value === '') return

      batch.push(function (done) {
        var whitelist = new Whitelist({ value: value, type: data.type, forum: data.forum })
        whitelist.save(done)
      })
    })

    batch.end(function (err, whitelists) {
      if (err) {
        log('Found error %s', err)
        return fn(err)
      }

      log('Saved whitelists %j', pluck(whitelists, 'id'))
      fn(null, whitelists)
    })
  } else {
    var whitelist = new Whitelist(data)
    whitelist.save(onsave)
  }

  function onsave (err) {
    if (err) {
      log('Found error %s', err)
      return fn(err)
    }

    log('Saved whitelist %s', whitelist.id)
    fn(null, whitelist)
  }

  return this
}

/**
 * Update whitelist by `id` and `data`
 *
 * @param {ObjectId|String} data to create whitelist
 * @param {Function} fn callback function
 *   - 'err' error found on query or `null`
 *   - 'whitelist' item created or `undefined`
 * @return {Module} `whitelist` module
 * @api public
 */

exports.update = function update (id, data, fn) {
  log('Updating whitelist %s with %j', id, data)

  exports.get(id, onget)

  function onget (err, whitelist) {
    if (err) {
      log('Found error %s', err.message)
      return fn(err)
    }

    // update and save whitelist document with data
    whitelist.set(data)
    whitelist.save(onupdate)
  }

  function onupdate (err, whitelist) {
    if (!err) {
      log('Saved whitelist %s', whitelist.id)
      return fn(null, whitelist)
    }
    log('Found error %s', err)
    return fn(err)
  }

  return this
}

/**
 * Remove whitelist
 *
 * @param {String} id
 * @param {Function} fn callback function
 *   - 'err' error found while process or `null`
 * @api public
 */

exports.remove = function remove (id, fn) {
  exports.get(id, function (err, whitelist) {
    if (err) return fn(err)

    whitelist.remove(function (err) {
      if (err) {
        log('Found error %s', err)
        return fn(err)
      }

      log('Whitelist %s removed', whitelist.id)
      fn(null)
    })
  })
}

/**
 * Duplicate whitelists
 *
 * @param {String} id
 * @param {Function} fn callback function
 *   - 'err' error found while process or `null`
 * @api public
 */

exports.copy = function copy (source, destination, fn) {
  exports.search({ forum: source }, function (err, whitelists) {
    if (err) return fn(err)

    log('found whitelists %j', pluck(whitelists, 'id'))

    var batch = new Batch()
    for (var i = 0; i < whitelists.length; i++) {
      const data = whitelists[i]
      batch.push(function (done) {
        new Whitelist({
          value: data.value,
          type: data.type,
          forum: destination
        }).save(done)
      })
    }

    batch.end(function (err, results) {
      if (err) {
        log('Found error %s', err)
        return fn(err)
      }

      log('Saved whitelists %j', pluck(results, 'id'))
      return fn(null, results)
    })
  })
}
