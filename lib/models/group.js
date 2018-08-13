var mongoose = require('mongoose')
var Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

/**
 * Define `Group` Schema
 */
var GroupSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  justificatoryUrl: { type: String },
  logoUrl: { type: String },
  users: [{ type: ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
})
/**
 * Make Schema `.toObject()` and
 * `.toJSON()` parse getters for
 * proper JSON API response
 */

GroupSchema.set('toObject', { getters: true })
GroupSchema.set('toJSON', { getters: true })
/**
 * Expose `Groups` Model
 */

module.exports = function initialize (conn) {
  return conn.model('Group', GroupSchema)
}
