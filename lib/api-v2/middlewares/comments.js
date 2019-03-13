const ObjectId = require('mongoose').Types.ObjectId
const api = require('../db-api')

module.exports.findById = function findById (req, res, next) {
  const id = req.params.id

  api.comments.find({ _id: id })
  .populate('author')
  .findOne()
    .exec()
    .then((comment) => {
      if (!comment) return next(new Error404(id, 'comment'))
      req.comment = comment
      next()
    })
    .catch(next)
}

module.exports.populateTopic = function populateTopic (req, res, next) {
  const comment = req.comment
  if (!comment) return next(new Error503('missing comment (populateTopic)'))
  const id = new ObjectId(comment.reference)
  api.topics.find({ _id: id })
    .populate('forum')
    .findOne()
    .exec()
    .then((topic) => {
      if (!topic) return next(new Error404(id, 'topic'))
      req.topic = topic
      next()
    })
    .catch(next)
}

class Error404 extends Error {
  constructor (id, type) {
    super(`${type} ${id} not found.`)

    this.status = 404
    switch (type) {
      case 'comment':
        this.code = 'COMMENT_NOT_FOUND'
        break
      case 'topic':
        this.code = 'TOPIC_NOT_FOUND'
        break
      default:
        this.code = 'NOT_FOUND'
    }
  }
}

class Error503 extends Error {
  constructor (message) {
    super(message)
    this.status = 503
  }
}
