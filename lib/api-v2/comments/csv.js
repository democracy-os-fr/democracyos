const express = require('express')
const json2csv = require('json-2-csv').json2csv
const moment = require('moment')
const t = require('t-component')
const toNumber = require('mout/lang/toNumber')
const toString = require('mout/lang/toString')
const hasProp = require('mout/object/has')
const config = require('lib/config')
const urlBuilder = require('lib/url-builder')
const middlewares = require('../middlewares')
const api = require('../db-api')

const app = module.exports = express()

const topicTitles = [
  'Topic ID',
  'Topic Title',
  'Topic URL'
]
const commentTitles = [
  'Comment ID',
  'Comment Date',
  'Comment Time',
  'Comment Date-time',
  'Comment Text',
  'Comment Author Fullname'
]
const replyTitles = [
  'Reply ID',
  'Reply Date',
  'Reply Time',
  'Reply Date-time',
  'Reply Text',
  'Reply Author Fullname'
]

if (config.extra.user.org) {
  commentTitles.push('Comment Author organization')
  replyTitles.push('Reply Author organization')
}
if (config.extra.user.age) {
  commentTitles.push('Comment Author age')
  replyTitles.push('Reply Author age')
}
if (config.extra.user.job) {
  commentTitles.push('Comment Author job')
  replyTitles.push('Reply Author job')
}
if (config.extra.user.postal) {
  commentTitles.push('Comment Author postal')
  replyTitles.push('Reply Author postal')
}

const titles = topicTitles.concat(commentTitles, replyTitles)

const emptyReply = {
  createdAt: '',
  id: '',
  _id: '',
  text: '',
  author: { fullName: '', extra: {} }
}

function fullUrl (topicId, forumName) {
  return config.protocol + '://' + config.host + urlBuilder
    .for('site.topic', {
      id: topicId,
      forum: forumName
    })
}

function escapeTxt (text) {
  if (!text) return ''
  return text.replace(/"/g, '\'').replace(/\r/g, '').replace(/\n/g, '')
}

function mapAge (key) {
  return toNumber(key) > 0 ? t('user.extra.age.short.' + key) : ''
}

function mapJob (key) {
  return toNumber(key) > 0 ? t('user.extra.job.' + key) : ''
}

app.get('/comments.csv',
middlewares.users.restrict,
middlewares.forums.findByName,
middlewares.topics.findAllFromForum,
middlewares.forums.privileges.canChangeTopics,
function getCsv (req, res, next) {
  console.log(titles)
  api.comments.populateTopics(req.topics)
    .then((topicsComments) => {
      const commentsData = [ titles ]

      topicsComments.forEach((topic) => {
        topic.comments.forEach((comment) => {
          (comment.replies.length === 0 ? [emptyReply] : comment.replies)
            .forEach((reply) => {
              let tData = [
                topic.id,
                `"${escapeTxt(topic.mediaTitle)}"`,
                fullUrl(topic.id, req.forum.name)
              ]

              let cData = [
                comment.id,
                `"${escapeTxt(moment(comment.createdAt, '', req.locale).format('LL'))}"`,
                `"${escapeTxt(moment(comment.createdAt, '', req.locale).format('LT'))}"`,
                comment.createdAt,
                `"${escapeTxt(comment.text)}"`,
                `"${escapeTxt(comment.author.fullName)}"`
              ]

              if (config.extra.user.org) {
                cData.push(hasProp(comment, 'author.extra.org') ? `"${escapeTxt(comment.author.extra.org)}"` : '')
              }
              if (config.extra.user.age) {
                cData.push(hasProp(comment, 'author.extra.age') ? `"${escapeTxt(mapAge(comment.author.extra.age))}"` : '')
              }
              if (config.extra.user.job) {
                cData.push(hasProp(comment, 'author.extra.job') ? `"${escapeTxt(mapJob(comment.author.extra.job))}"` : '')
              }
              if (config.extra.user.postal) {
                cData.push(hasProp(comment, 'author.extra.postal') ? `"${escapeTxt(comment.author.extra.postal)}"` : '')
              }

              let rData = [
                toString(reply._id),
                `"${(reply.createdAt && escapeTxt(moment(reply.createdAt, '', req.locale).format('LL')))}"`,
                `"${(reply.createdAt && escapeTxt(moment(reply.createdAt, '', req.locale).format('LT')))}"`,
                reply.createdAt,
                `"${escapeTxt(reply.text)}"`,
                `"${escapeTxt(reply.author.fullName)}"`
              ]

              if (config.extra.user.org) {
                rData.push(hasProp(reply, 'author.extra.org') ? `"${escapeTxt(reply.author.extra.org)}"` : '')
              }
              if (config.extra.user.age) {
                rData.push(hasProp(reply, 'author.extra.age') ? `"${escapeTxt(mapAge(reply.author.extra.age))}"` : '')
              }
              if (config.extra.user.job) {
                rData.push(hasProp(reply, 'author.extra.job') ? `"${escapeTxt(mapJob(reply.author.extra.job))}"` : '')
              }
              if (config.extra.user.postal) {
                rData.push(hasProp(reply, 'author.extra.postal') ? `"${escapeTxt(reply.author.extra.postal)}"` : '')
              }

              commentsData.push(tData.concat(cData, rData))
            })
        })
      })

      json2csv(commentsData, function (err, csv) {
        if (err) throw new Error('comments.csv: array to csv error')
        res.status(200)
        res.set({
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename=' + req.forum.name.replace(/\s/g, '-') + '.csv'
        })
        res.write(csv)
        res.end()
      }, { prependHeader: false })
    }).catch(next)
})
