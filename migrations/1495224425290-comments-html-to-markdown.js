require('lib/models')()

const migrationTitle = 'update comments text (HTML to markdown)'

const toMarkdown = require('to-markdown')
const converters = [{
  filter: 'p',
  replacement: function (content) {
    return content + '  \n\n'
  }
}, {
  filter: ['span', 'u'],
  replacement: function (content) {
    return content + ' '
  }
}]
// const parseComment = require('lib/site/comment-layout/comment-article/comments/parse-comment.js')

const Comment = require('lib/models').Comment
const dbReady = require('lib/models').ready

const mapPromises = (fn) => (array) => Promise.all(array.map(fn))

exports.up = function up (done) {
  dbReady()
    .then(() => Comment.collection.find({}).toArray())
    .then(mapPromises(function (comment) {
      // console.dir(comment)
      if (comment.text) {
        comment.replies = comment.replies.map((reply, i) => {
          reply.text = toMarkdown(reply.text, {
            converters: converters
          })
          return reply
        })
        Comment.collection.findOneAndUpdate({ _id: comment._id }, {
          $set: {
            text: toMarkdown(comment.text, {
              converters: converters
            }),
            replies: comment.replies
          }
        })
      } else {
        return comment
      }
    }))
    .then(function (results) {
      const total = results.filter((v) => !!v).length
      console.log(`${migrationTitle} from ${total} comments succeded.`)
      done()
    })
    .catch(function (err) {
      console.log(`${migrationTitle} failed at `, err)
      done(err)
    })
}

exports.down = function down (done) {
  console.log(`${migrationTitle} has no down migration`)
  done()
}
