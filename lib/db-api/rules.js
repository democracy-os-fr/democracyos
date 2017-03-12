/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Rules = mongoose.model('Rules');
var utils = require('lib/utils');
var pluck = utils.pluck;
var config = require('lib/config');
var log = require('debug')('democracyos:db-api:rules');

/**
 * Get all rules
 *
 * @param {Function} fn callback function
 *   - 'err' error found on query or `null`
 *   - 'rules' list rules found or `undefined`
 * @return {Module} `rules` module
 * @api public
 */

exports.all = function all(fn) {
  log('Looking for all rules');

  Rules
  .find({'type': {'$in': config.rules}})
  .exec(function (err, rules) {
    if (err) {
      log('Found error %j', err);
      return fn(err);
    }

    log('Delivering rules %j', pluck(rules, 'id'));
    fn(null, rules);
  });

  return this;
};

/**
 * Get Rules form `id` string or `ObjectId`
 *
 * @param {String|ObjectId} id Rules's `id`
 * @param {Function} fn callback function
 *   - 'err' error found while process or `null`
 *   - 'rules' found item or `undefined`
 * @api public
 */

exports.get = function get(id, fn) {
  log('Looking for rules %s', id);
  Rules
  .findById(id)
  .exec(function (err, rules) {
    if (err) {
      log('Found error %s', err);
      return fn(err);
    }

    if (!rules) {
      log('Rules %s not found', id);
      return fn(null);
    }
    log('Delivering rules %s', rules.id);
    fn(null, rules);
  });
};

/**
 * Search rules from query
 *
 * @param {Object} query filter
 * @param {Function} fn callback function
 *   - 'err' error found while process or `null`
 *   - 'rules' list of rules objects found or `undefined`
 * @return {Module} `rules` module
 * @api public
 */

exports.search = function search(query, fn) {
  log('Searching for rules matching %j', query);

  Rules
    .find(query, function(err, rules) {
    if (err) {
      log('Found error: %j', err);
      return fn(err);
    }

    log('Found rules %j for %j', pluck(rules, 'id'), query);
    fn(null, rules);
  });

  return this;
};

/**
 * Creates rules
 *
 * @param {Object} data to create rules
 * @param {Function} fn callback function
 *   - 'err' error found on query or `null`
 *   - 'rules' rules created or `undefined`
 * @return {Module} `rules` module
 * @api public
 */

exports.create = function create(data, fn) {
  log('Creating new rules %j', data);

  var rules = new Rules(data);
  rules.save((err) => {
    if (err) return log('Found error %s', err); fn(err);

    log('Saved rules %s', rules.id);
    fn(null, rules);
  });

  return this;
};

/**
 * Update rules by `id` and `data`
 *
 * @param {ObjectId|String} data to create rules
 * @param {Function} fn callback function
 *   - 'err' error found on query or `null`
 *   - 'rules' item created or `undefined`
 * @return {Module} `rules` module
 * @api public
 */

exports.update = function update(id, data, fn) {
  log('Updating rules %s with %j', id, data);

  exports.get(id, onget);

  function onget(err, rules) {
    if (err) {
      log('Found error %s', err.message);
      return fn(err);
    }

    // update and save rules document with data
    rules.set(data);
    rules.save(onupdate);
  }

  function onupdate(err, rules) {
    if (!err) return log('Saved rules %s', rules.id); fn(null, rules);
    return log('Found error %s', err); fn(err);
  }

  return this;
};

/**
 * Remove rules
 *
 * @param {String} id
 * @param {Function} fn callback function
 *   - 'err' error found while process or `null`
 * @api public
 */

exports.remove = function remove(id, fn) {
  exports.get(id, function (err, rules) {
    if (err) return fn(err);

    rules.remove(function (_err) {
      if (_err) return log('Found error %s', _err); fn(_err);

      log('Rules %s removed', rules.id);
      fn(null);
    });
  });
};
