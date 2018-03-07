const ObjectId = require('mongoose').Types.ObjectId
const api = require('../db-api')

module.exports.findById = function findById (req, res, next) {
  const id = req.params.id

  api.comments.find({ _id: id })
  .populate('author')
  .findOne()
    .exec()
    .then((comment) => {
      if (!comment) return next(new Error404(id))
      req.comment = comment
      next()
    })
    .catch(next)
}

module.exports.populateTopic = function populateTopic (req, res, next) {
  const comment = req.comment
  if (!comment) return next(new Error503('Missing comment (populateTopic)'))
  const id = new ObjectId(comment.reference)
  api.topics.find({ _id: id })
    .populate('forum')
    .findOne()
    .exec()
    .then((topic) => {
      if (!topic) return next(new Error503(`Topic ${id} not found (populateTopic)`))
      req.topic = topic
      next()
    })
    .catch(next)
}

class Error404 extends Error {
  constructor (id) {
    super(`Comment ${id} not found.`)

    this.status = 404
    this.code = 'COMMENT_NOT_FOUND'
  }
}

class Error503 extends Error {
  constructor (message) {
    super(message)

    this.status = 503
    this.code = 'COMMENT_NOT_FOUND'
  }
}
