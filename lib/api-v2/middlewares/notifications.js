const notifier = require('democracyos-notifier')
const marked = require('marked')
const urlBuilder = require('lib/url-builder')
const config = require('lib/config')
const utils = require('lib/utils')
const api = require('lib/db-api')
const userScopes = require('../db-api/users/scopes')

const renderer = new marked.Renderer()

renderer.heading = function (text, level) {
  return `<h${level}>${text}</h${level}>`
}

renderer.link = function (href, title, text) {
  return `<a href="${href}" title="${title}" rel="noopener noreferer">${text}</a>`
}

marked.setOptions({
  sanitize: true,
  smartypants: true,
  renderer
})

exports.comment = function comment (req, res, next) {
  const topic = {
    id: req.topic._id.toString(),
    mediaTitle: req.topic.mediaTitle,
    forum: req.topic.forum
  }

  const comment = {
    id: req.comment.id,
    author: userScopes.ordinary.expose(req.user),
    text: marked(req.comment.text)
  }

  const topicUrl = utils.buildUrl(config, {
    pathname: urlBuilder.for('site.topic', {
      forum: req.forum.name,
      id: req.topic.id
    })
  })

  notifier.now('new-comment', {
    topic,
    comment,
    url: `${topicUrl}#comment-${comment.id}`
  }).then(() => {
    next()
  }).catch(next)
}

exports.commentReply = function commentReply (req, res, next) {
  api.user.get(req.comment.author.id, function (err, commentAuthor) {
    if (err) return next(err)

    const topic = {
      id: req.topic._id.toString(),
      mediaTitle: req.topic.mediaTitle,
      forum: req.topic.forum
    }

    const reply = {
      id: req.reply.id,
      author: userScopes.ordinary.expose(req.user),
      text: marked(req.reply.text)
    }

    const comment = {
      id: req.comment.id,
      author: userScopes.ordinary.expose(commentAuthor),
      text: marked(req.comment.text)
    }

    const topicUrl = utils.buildUrl(config, {
      pathname: urlBuilder.for('site.topic', {
        forum: req.forum.name,
        id: req.topic.id
      })
    })

    let authors = [commentAuthor.id]
    let quotes = {}
    quotes[commentAuthor.id] = {
      id: req.comment.id,
      createdAt: req.comment.createdAt,
      text: marked(req.comment.text)
    }

    for (var i of req.comment.replies) {
      if (authors.indexOf(i.author.id) < 0) {
        authors.push(i.author.id)
        quotes[i.author.id] = {
          id: i._id,
          createdAt: i.createdAt,
          text: marked(i.text)
        }
      } else if (new Date(i.createdAt) - new Date(quotes[i.author.id].createdAt) > 0) {
        quotes[i.author.id] = {
          id: i._id,
          createdAt: i.createdAt,
          text: marked(i.text)
        }
      }
    }

    notifier.now('comment-reply', {
      topic,
      reply,
      comment,
      authors,
      quotes,
      url: `${topicUrl}#comment-${comment.id}`
    }).then(() => {
      next()
    }).catch(next)
  })
}
