const Forum = require('lib/models').Forum

/**
 * Default find Method, to be used in favor of Model.find()
 * @method find
 * @param  {object} query - mongoose query options
 * @return {Mongoose Query}
 */
const find = (query) => {
  return Forum.find(Object.assign({
    deletedAt: null
  }, query))
}

const edit = (query, args) => {
  return Forum
    .findOneAndUpdate(query, args, { new: true })
}
/**
 * Publish Forum
 *
 * @param {String} opts.id Forum `id`
 * @return {promise}
 * @api public
 */

const publish = (opts) => {
  const id = opts.id
  return find()
    .findOne()
    .where({ _id: id })
    .then((forum) => {
      forum.publishedAt = new Date()
      return forum.save()
    })
}

/**
 * Unpublish Forum
 *
 * @param {String} opts.id Forum `id`
 * @return {promise}
 * @api public
 */

const unpublish = (opts) => {
  const id = opts.id
  return find()
    .findOne()
    .where({ _id: id })
    .then((Forum) => {
      Forum.publishedAt = null
      return Forum.save()
    })
}

exports.edit = edit
exports.find = find
exports.publish = publish
exports.unpublish = unpublish
