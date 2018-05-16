import { connect } from 'react-refetch'
import parseComment from 'lib/site/topic-layout/topic-article/comments/parse-comment'

const commentsSync = commentsSyncFactory()
const commentsSyncOne = (body) => ({ commentsFetch: commentsSync.one(body) })

export default connect.defaults({
  handleResponse: handleResponse
})((props) => {
  const handleVote = (value, id) => ({
    commentsVoting: {
      url: `/api/v2/comments/${id}/vote`,
      method: 'POST',
      body: JSON.stringify({ value }),
      force: true,
      andThen: commentsSyncOne
    }
  })

  const handleUnvote = (id) => ({
    commentsUnvoting: {
      url: `/api/v2/comments/${id}/vote`,
      method: 'DELETE',
      force: true,
      andThen: commentsSyncOne
    }
  })

  const handleCreate = (data) => {
    const body = Object.assign({}, data, { topicId: props.topic.id })

    return {
      commentsCreating: {
        url: `/api/v2/comments`,
        method: 'POST',
        force: true,
        body: JSON.stringify(body),
        andThen: commentsSyncOne
      }
    }
  }

  const handleReply = (data) => ({
    commentsReplying: {
      url: `/api/v2/comments/${data.id}/reply`,
      method: 'POST',
      force: true,
      body: JSON.stringify(data),
      andThen: commentsSyncOne
    }
  })

  const handleDelete = (data) => ({
    commentDeleting: {
      url: `/api/v2/comments/${data.id}`,
      method: 'DELETE',
      force: true,
      body: JSON.stringify(data),
      andThen: () => ({ commentsFetch: commentsSync.remove(data.id) })
    }
  })

  const handleDeleteReply = (data) => ({
    commentDeleting: {
      url: `/api/v2/comments/${data.id}/replies/${data.replyId}`,
      method: 'DELETE',
      force: true,
      body: JSON.stringify(data),
      andThen: commentsSyncOne
    }
  })

  const handleFlag = (id) => ({
    commentsFlagging: {
      url: `/api/v2/comments/${id}/flag`,
      method: 'POST',
      force: true,
      andThen: commentsSyncOne
    }
  })

  const handleUnflag = (id) => ({
    commentsUnflagging: {
      url: `/api/v2/comments/${id}/unflag`,
      method: 'POST',
      force: true,
      andThen: commentsSyncOne
    }
  })

  const handleEdit = (id, title, text) => ({
    commentsUnflagging: {
      url: `/api/v2/comments/${id}`,
      method: 'PUT',
      force: true,
      body: JSON.stringify({ title, text }),
      andThen: commentsSyncOne
    }
  })

  const handleReplyEdit = (id, replyId, text) => ({
    commentsUnflagging: {
      url: `/api/v2/comments/${id}/replies/${replyId}`,
      method: 'PUT',
      force: true,
      body: JSON.stringify({ text }),
      andThen: commentsSyncOne
    }
  })

  return {
    handleUpvote: handleVote.bind(null, 'positive'),
    handleDownvote: handleVote.bind(null, 'negative'),
    handleUnvote,
    handleCreate,
    handleReply,
    handleDelete,
    handleDeleteReply,
    handleFlag,
    handleUnflag,
    handleEdit,
    handleReplyEdit
  }
})

function commentsSyncFactory () {
  let items = []

  const sync = {

    clear () {
      items = []
    },

    one (body) {
      const comment = body.results.comment

      var i = -1
      items.some((c, index) => {
        if (c.id === comment.id) {
          i = index
          return true
        }
      })

      delete body.results

      if (i === -1) {
        items.unshift(comment)
      } else {
        items[i] = comment
      }

      return {
        value: items,
        meta: body,
        force: true,
        refreshing: true
      }
    },

    remove (id) {
      var i = -1
      items.some((c, index) => {
        if (c.id === id) {
          i = index
          return true
        }
      })

      if (i > -1) items.splice(i, 1)

      return {
        value: items,
        force: true,
        refreshing: true
      }
    }
  }

  return sync
}

function handleResponse (response) {
  const isEmptyResponse = response.headers.get('content-length') === '0'

  if (isEmptyResponse || response.status === 204) return

  const json = response.json()

  if (response.status < 200 || response.status > 300) {
    return json.then((err) => Promise.reject(err))
  }

  return json.then(parseResponseComments).then(parseResponseComment)
}

function parseResponseComments (body) {
  if (!body.results || !body.results.comments) return body

  return Promise.all(body.results.comments.map(parseComment))
    .then((comments) => {
      body.results.comments = comments
      return body
    })
}

function parseResponseComment (body) {
  if (!body.results || !body.results.comment) return body

  return parseComment(body.results.comment)
    .then((comment) => {
      body.results.comment = comment
      return body
    })
}
