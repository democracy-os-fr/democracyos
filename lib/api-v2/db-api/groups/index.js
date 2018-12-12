// const log = require('debug')('democracyos:api-v2:db:groups')
const { Group } = require('lib/models')
const scopes = require('./scopes')
const pluck = require('mout/array/pluck')

/**
 * Default find Method, to be used in favor of Model.find()
 * @method find
 * @param  {object} query - Mongoose query options
 * @return {Mongoose Query}
 */
function find (query) {
  return Group.find(Object.assign({}, query))
}

exports.find = find

function findRandom (query, n = 3) {
  return Group.collection.aggregate([
    { $match: query },
    { $sample: { size: n } },
    { $project: { _id: true } }
  ])
}

exports.findRandom = findRandom

exports.get = function get (query, opts) {
  opts = opts || {}
  return find(query)
    .findOne()
    .populate(scopes.ordinary.populate)
    .select(scopes.ordinary.select)
    .exec()
    .then((group) => {
      return scopes.ordinary.expose(group, opts.user)
    })
}

/**
 * Get the public listing of groups
 * @method list
 * @param  {object} opts
 * @param  {number} opts.limit - Amount of results per page
 * @param  {number} opts.page - Page number
 * @param  {document} opts.user - User data is beign fetched for
 * @return {promise}
 */
exports.list = function list (opts) {
  opts = opts || {}
  return find()
    .populate(scopes.ordinary.populate)
    .select(scopes.ordinary.select)
    .limit(opts.limit)
    .skip((opts.page - 1) * opts.limit)
    .exec()
    .then((groups) => groups.map((group) => {
      return scopes.ordinary.expose(group, opts.user)
    }))
}

/**
 * Get the count of total groupers
 * @method listCount
 * @param  {object} opts
 * @param  {objectId} opts.topicId
 * @return {promise}
 */
exports.membersCount = function membersCount (opts) {
  opts = opts || {}

  return Group.aggregate([
    { $match: { _id: opts.id } },
    { $project: { members: { $size: '$users' } } }
  ]).exec()
  .then((result) => result.members)
}

/**
 * Get the count of total groups of the public listing
 * @method listCount
 * @param  {object} opts
 * @param  {objectId} opts.topicId
 * @return {promise}
 */
exports.listCount = function listCount (opts) {
  opts = opts || {}

  return find().count().exec()
}

/**
 * Create a group
 * @method create
 * @param  {object} opts
 * @return {promise}
 */
exports.create = function create (opts) {
  const {
    name,
    description,
    logoUrl,
    justificatoryUrl,
    users,
    owners
  } = opts

  return Group.create({
    name,
    description,
    logoUrl,
    justificatoryUrl,
    users,
    owners
  }).then((group) => scopes.ordinary.expose(group, opts.user))
}

/**
 * Delete group
 * @method delete
 * @param  {object} opts
 * @param {document} opts.user - Author of the group
 * @param {document} opts.id - Group id
 * @return {promise}
 */
exports.removeGroup = (function () {
  function doRemoveGroup (group) {
    return new Promise((resolve, reject) => {
      group.remove((err) => {
        if (err) reject(err)
        resolve(group)
      })
    })
  }

  return function removeGroup (opts) {
    const id = opts.id

    return find()
      .findOne()
      .where({ _id: id })
      .populate(scopes.ordinary.populate)
      .select(scopes.ordinary.select)
      .exec()
      .then(doRemoveGroup)
  }
})()

/**
 * Edit group
 * @method vote
 * @param  {object} opts
 * @param {string} opts.id - Group Id
 * @return {promise}
 */
exports.edit = function edit (opts) {
  return find()
    .findOne()
    .where({ _id: opts.id })
    .populate(scopes.ordinary.populate)
    .select(scopes.ordinary.select)
    .exec()
    .then(doEdit.bind(null, opts))
    .then((group) => scopes.ordinary.expose(group, opts.user))
}

function doEdit (data, group) {
  const {
    name,
    description,
    logoUrl,
    justificatoryUrl,
    users,
    owners
  } = data
  return new Promise((resolve, reject) => {
    group.name = name
    group.description = description
    group.logoUrl = logoUrl
    group.justificatoryUrl = justificatoryUrl
    group.users = pluck(users, 'id')
    group.owners = pluck(owners, 'id')
    group.editedAt = Date.now()
    group.save(function (err, group) {
      if (err) return reject(err)
      group.populate(scopes.ordinary.populate, (err, _group) => {
        if (err) return reject(err)
        resolve(_group)
      })
    })
  })
}
