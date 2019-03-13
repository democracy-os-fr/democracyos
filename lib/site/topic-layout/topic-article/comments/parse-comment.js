import marked from 'marked'

const renderer = new marked.Renderer()

renderer.heading = function (text, level) {
  return `<h${level}>${text}</h${level}>`
}

renderer.link = function (href, title, text) {
  return `<a href="${href}" title="${title}" rel="noopener noreferer" target="_blank">${text}</a>`
}

renderer.linkByRef = function (id, type, text) {
  return `<span data-ref="${id}" data-type="${type}"><a href="#comment-${id}" title="${id}">${text}</a></span>`
}

renderer.text = function (text) {
  var matches = text.match(/(?:^|\s)(?:#)([a-zA-Z\d]+)/gm)
  if (matches) {
    for (let match of matches) {
      match = match.trim()
      text = text.replace(match, renderer.linkByRef(match.substring(1), 'comment', match))
    }
  }
  return text
}

export default function parseComment (comment) {
  return new Promise((resolve, reject) => {
    if (!comment.text) return resolve(comment)
    marked(comment.text, {
      sanitize: true,
      smartypants: true,
      renderer
    }, function (err, textHtml) {
      if (err) return reject(err)
      comment.textHtml = textHtml
      resolve(comment)
    })
  })
    .then((comment, err) => {
      if (err) return Promise.reject(err)
      if (!comment.replies) return Promise.resolve(comment)
      return Promise.all(
        comment.replies.map(
          (reply) => {
            return new Promise((resolve, reject) => {
              marked(reply.text, {
                sanitize: true,
                smartypants: true,
                renderer
              }, function (err, textHtml) {
                if (err) return reject(err)
                resolve(textHtml)
              })
            })
          }
        )
      )
        .then((replies, err) => {
          if (err) return Promise.reject(err)
          comment.replies = comment.replies.map((reply, i) => {
            reply.textHtml = replies[i]
            return reply
          })
          return Promise.resolve(comment)
        })
    })
}
