const express = require('express')
const TopicPrivileges = require('lib/privileges/topic')
const shuffle = require('mout/array/shuffle')
const config = require('lib/config')
const validate = require('../validate')
const middlewares = require('../middlewares')
const api = require('../db-api')

const app = module.exports = express.Router()

app.get('/comments',
validate({
  query: Object.assign({}, validate.schemas.pagination, {
    topicId: {
      type: 'string',
      required: true,
      format: 'mongo-object-id',
      description: 'id of the Topic to fetch comments from'
    },
    sort: {
      type: 'string',
      enum: ['score', '-score', 'createdAt', '-createdAt', 'random'],
      default: '-score'
    }
  })
}),
middlewares.topics.findByTopicId,
middlewares.forums.findFromTopic,
middlewares.forums.privileges.canView,
function getComments (req, res, next) {
  Promise.all([
    api.comments.list({
      user: req.user,
      topicId: req.query.topicId,
      limit: req.query.limit,
      page: req.query.page,
      sort: req.query.sort
    }),
    api.comments.listCount(req.query)
  ]).then((results) => {
    res.status(200).json({
      status: 200,
      pagination: {
        count: results[1],
        page: req.query.page,
        pageCount: Math.ceil(results[1] / req.query.limit) || 1,
        limit: req.query.limit
      },
      results: {
        comments: results[0]
      }
    })
  }).catch(next)
})

app.get('/comments/:type',
  middlewares.forums.findFromQuery,
  middlewares.forums.privileges.canView,
  middlewares.topics.findAllFromForum,
  function getFeaturedComments (req, res, next) {
    api.comments.getFeaturedComments({
      type: req.params.type || 'last',
      topics: req.topics,
      forum: req.forum || false,
      user: req.user || false,
      limit: req.query.limit,
      page: req.query.page
    })
    .then((comments) => {
      req.comments = comments
      return res.json({
        status: 200,
        pagination: {
          count: comments.length,
          page: req.query.page,
          pageCount: Math.ceil(comments.length / req.query.limit) || 1,
          limit: req.query.limit
        },
        results: {
          comments: comments
        }
      })
    }).catch(next)
  })

app.get('/comment/:id',
  middlewares.comments.findById,
  middlewares.comments.populateTopic,
  middlewares.forums.findFromTopic,
  function (req, res, next) {
    if (req.topic['_doc']) {
      req.topic['_doc'].privileges = TopicPrivileges.all(req.forum, req.user, req.topic)
    } else {
      req.topic.privileges = TopicPrivileges.all(req.forum, req.user, req.topic)
    }
    next()
  },
  function getComment (req, res, next) {
    if (req.comment) {
      req.comment.topic = req.topic
      res.status(200).json({
        status: 200,
        comment: req.comment,
        topic: req.topic || {}
      })
    } else {
      res.status(404).json({ id: req.id })
    }
  }
)

app.post('/comments',
middlewares.users.restrict,
validate({
  payload: {
    topicId: {
      type: 'string',
      required: true,
      format: 'mongo-object-id',
      description: 'id of the Topic to create comment on'
    },
    title: {
      type: 'string',
      description: 'title of the comment'
    },
    text: {
      type: 'string',
      required: true,
      description: 'text of the comment'
    }
  }
}, {
  filter: true
}),
middlewares.topics.findByBodyTopicId,
middlewares.forums.findFromTopic,
function (req, res, next) {
  if (req.topic['_doc']) {
    req.topic['_doc'].privileges = TopicPrivileges.all(req.forum, req.user, req.topic)
  } else {
    req.topic.privileges = TopicPrivileges.all(req.forum, req.user, req.topic)
  }
  next()
},
middlewares.topics.privileges.canComment,
function postComments (req, res, next) {
  api.comments.create({
    title: req.body.title,
    text: req.body.text,
    user: req.user,
    topicId: req.body.topicId
  }).then((comment) => {
    req.comment = comment
    next()
  }).catch(next)
},
middlewares.notifications.comment,
function (req, res) {
  if (req.topic) { req.comment.topic = req.topic }
  res.json({
    status: 200,
    results: {
      comment: req.comment
    }
  })
})

app.post('/comments/:id/vote',
middlewares.users.restrict,
validate({
  payload: {
    value: {
      type: 'string',
      enum: ['positive', 'negative'],
      required: true
    }
  }
}),
middlewares.comments.findById,
middlewares.topics.findFromComment,
middlewares.forums.findFromTopic,
function (req, res, next) {
  if (req.topic['_doc']) {
    req.topic['_doc'].privileges = TopicPrivileges.all(req.forum, req.user, req.topic)
  } else {
    req.topic.privileges = TopicPrivileges.all(req.forum, req.user, req.topic)
  }
  next()
},
middlewares.topics.privileges.canComment,
function postCommentsVote (req, res, next) {
  api.comments.vote({
    id: req.params.id,
    user: req.user,
    value: req.body.value
  }).then((comment) => {
    if (req.topic) { comment.topic = req.topic }
    res.status(200).json({
      status: 200,
      results: {
        comment: comment
      }
    })
  }).catch(next)
})

app.delete('/comments/:id/vote',
middlewares.users.restrict,
middlewares.comments.findById,
middlewares.topics.findFromComment,
middlewares.forums.findFromTopic,
function (req, res, next) {
  if (req.topic['_doc']) {
    req.topic['_doc'].privileges = TopicPrivileges.all(req.forum, req.user, req.topic)
  } else {
    req.topic.privileges = TopicPrivileges.all(req.forum, req.user, req.topic)
  }
  next()
},
middlewares.topics.privileges.canComment,
function delCommentsVote (req, res, next) {
  api.comments.unvote({
    id: req.params.id,
    user: req.user
  }).then((comment) => {
    if (req.topic) { comment.topic = req.topic }
    res.status(200).json({
      status: 200,
      results: {
        comment: comment
      }
    })
  }).catch(next)
})

app.post('/comments/:id/reply',
middlewares.users.restrict,
validate({
  payload: {
    text: {
      type: 'string',
      required: true,
      description: 'text of the comment'
    }
  }
}, {
  filter: true
}),
middlewares.comments.findById,
middlewares.topics.findFromComment,
middlewares.forums.findFromTopic,
function (req, res, next) {
  if (req.topic['_doc']) {
    req.topic['_doc'].privileges = TopicPrivileges.all(req.forum, req.user, req.topic)
  } else {
    req.topic.privileges = TopicPrivileges.all(req.forum, req.user, req.topic)
  }

  next()
},
middlewares.topics.privileges.canComment,
function postCommentReply (req, res, next) {
  api.comments.reply({
    id: req.params.id,
    user: req.user,
    text: req.body.text
  }).then((results) => {
    req.comment = results.comment
    req.reply = results.reply
    if (req.topic) { req.comment.topic = req.topic }

    next()
  }).catch(next)
},
middlewares.notifications.commentReply,
function (req, res) {
  res.status(200).json({
    status: 200,
    results: {
      comment: req.comment
    }
  })
})

app.delete('/comments/:id',
middlewares.users.restrict,
middlewares.comments.findById,
middlewares.topics.findFromComment,
middlewares.forums.findFromTopic,
middlewares.topics.privileges.canComment,
function delComment (req, res, next) {
  api.comments.removeComment({
    user: req.user,
    forum: req.forum,
    id: req.params.id
  }).then(() => {
    res.status(200).json({
      status: 200
    })
  }).catch(next)
})

app.delete('/comments/:id/replies/:replyId',
middlewares.users.restrict,
middlewares.comments.findById,
middlewares.topics.findFromComment,
middlewares.forums.findFromTopic,
function (req, res, next) {
  if (req.topic['_doc']) {
    req.topic['_doc'].privileges = TopicPrivileges.all(req.forum, req.user, req.topic)
  } else {
    req.topic.privileges = TopicPrivileges.all(req.forum, req.user, req.topic)
  }
  next()
},
middlewares.topics.privileges.canComment,
function delReply (req, res, next) {
  api.comments.removeReply({
    user: req.user,
    forum: req.forum,
    id: req.params.id,
    replyId: req.params.replyId
  }).then((comment) => {
    if (req.topic) { comment.topic = req.topic }
    res.status(200).json({
      status: 200,
      results: {
        comment: comment
      }
    })
  }).catch(next)
})

app.post('/comments/:id/flag',
middlewares.users.restrict,
middlewares.comments.findById,
middlewares.topics.findFromComment,
middlewares.forums.findFromTopic,
function (req, res, next) {
  if (req.topic['_doc']) {
    req.topic['_doc'].privileges = TopicPrivileges.all(req.forum, req.user, req.topic)
  } else {
    req.topic.privileges = TopicPrivileges.all(req.forum, req.user, req.topic)
  }
  next()
},
middlewares.topics.privileges.canComment,
function postCommentsFlag (req, res, next) {
  api.comments.flag({
    id: req.params.id,
    user: req.user
  }).then((comment) => {
    if (req.topic) { comment.topic = req.topic }
    res.status(200).json({
      status: 200,
      results: {
        comment: comment
      }
    })
  }).catch(next)
})

app.post('/comments/:id/unflag',
middlewares.users.restrict,
middlewares.comments.findById,
middlewares.topics.findFromComment,
middlewares.forums.findFromTopic,
function (req, res, next) {
  if (req.topic['_doc']) {
    req.topic['_doc'].privileges = TopicPrivileges.all(req.forum, req.user, req.topic)
  } else {
    req.topic.privileges = TopicPrivileges.all(req.forum, req.user, req.topic)
  }
  next()
},
middlewares.topics.privileges.canComment,
function postCommentsUnflag (req, res, next) {
  api.comments.unflag({
    id: req.params.id,
    user: req.user
  }).then((comment) => {
    if (req.topic) { comment.topic = req.topic }
    res.status(200).json({
      status: 200,
      results: {
        comment: comment
      }
    })
  }).catch(next)
})

app.put('/comments/:id',
middlewares.users.restrict,
middlewares.comments.findById,
middlewares.topics.findFromComment,
middlewares.forums.findFromTopic,
function (req, res, next) {
  if (req.topic['_doc']) {
    req.topic['_doc'].privileges = TopicPrivileges.all(req.forum, req.user, req.topic)
  } else {
    req.topic.privileges = TopicPrivileges.all(req.forum, req.user, req.topic)
  }
  next()
},
middlewares.topics.privileges.canComment,
function putComments (req, res, next) {
  api.comments.edit({
    id: req.params.id,
    user: req.user,
    title: req.body.title,
    text: req.body.text
  }).then((comment) => {
    if (req.topic) { comment.topic = req.topic }
    res.status(200).json({
      status: 200,
      results: {
        comment: comment
      }
    })
  }).catch(next)
})

app.put('/comments/:id/replies/:replyId',
middlewares.users.restrict,
middlewares.comments.findById,
middlewares.topics.findFromComment,
middlewares.forums.findFromTopic,
function (req, res, next) {
  if (req.topic['_doc']) {
    req.topic['_doc'].privileges = TopicPrivileges.all(req.forum, req.user, req.topic)
  } else {
    req.topic.privileges = TopicPrivileges.all(req.forum, req.user, req.topic)
  }
  next()
},
middlewares.topics.privileges.canComment,
function putReply (req, res, next) {
  api.comments.editReply({
    id: req.params.id,
    replyId: req.params.replyId,
    user: req.user,
    text: req.body.text
  }).then((comment) => {
    if (req.topic) { comment.topic = req.topic }
    res.status(200).json({
      status: 200,
      results: {
        comment: comment
      }
    })
  }).catch(next)
})
