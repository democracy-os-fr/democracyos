import React, { Component } from 'react'
import { Link } from 'react-router'
import t from 't-component'
import urlBuilder from 'lib/url-builder'
import config from 'lib/config'
import userConnector from 'lib/site/connectors/user'
import CommentReplies from './replies/component'
import CommentHeader from './header/component'
import CommentFooter from './footer/component'
import CommentContent from './content/component'

export class Comment extends Component {
  constructor (props) {
    super(props)
    // let repliesVisibility = props.showReplies
    // if (props.comment && window.location.hash) {
    //   repliesVisibility = `#comment-${props.comment.id}` === window.location.hash
    // }
    this.state = {
      repliesVisibility: props.showReplies,
      showOptionsMenu: false,
      commentDeletingPending: false,
      overlayActive: '',
      overlayVisibility: false,
      editing: false
    }
  }

  componentWillReceiveProps (props) {
    if (props.commentDeleting) {
      if (
        props.commentDeleting.rejected &&
        props.commentDeleting.reason.error.code === 'HAS_REPLIES' &&
        this.state.commentDeletingPending
      ) {
        this.setState({
          repliesVisibility: props.showReplies,
          overlayActive: 'HAS_REPLIES_ERR',
          overlayVisibility: true
        })
      } else if (!props.commentDeleting.pending) {
        this.setState({
          repliesVisibility: props.showReplies,
          commentDeletingPending: false
        })
      }
    } else {
      this.setState({
        repliesVisibility: props.showReplies
      })
    }
  }

  componentWillMount () {
    if (this.props.comment.flags.length >= config.spamLimit) {
      this.setState({
        overlayActive: 'IS_SPAM',
        overlayVisibility: true
      })
    }
  }

  handleUnvote = (evt) => {
    if (this.showNeedsLoginOverlay()) return
    evt.currentTarget.classList.remove('active')
    this.props.onUnvote()
  }

  handleUpvote = (evt) => {
    if (this.showNeedsLoginOverlay()) return
    evt.currentTarget.classList.add('active')
    this.props.onUpvote()
  }

  handleDownvote = (evt) => {
    if (this.showNeedsLoginOverlay()) return
    evt.currentTarget.classList.add('active')
    this.props.onDownvote()
  }

  showNeedsLoginOverlay = () => {
    if (this.props.user.state.pending) return true

    if (this.props.user.state.rejected) {
      this.setState({
        overlayActive: 'NEEDS_LOGIN',
        overlayVisibility: true
      })

      return true
    }

    return false
  }

  handleToggleReplies = () => {
    this.setState({ repliesVisibility: !this.state.repliesVisibility })
  }

  handleToggleOptionsMenu = () => {
    this.setState({ showOptionsMenu: !this.state.showOptionsMenu })
  }

  handleHideOverlay = () => {
    this.setState({
      overlayVisibility: false
    })
  }

  handleShowOverlay = (active) => () => {
    this.setState({
      overlayVisibility: true,
      overlayActive: active
    })
  }

  handleDelete = () => {
    this.setState({
      overlayVisibility: false,
      commentDeletingPending: true
    })
    this.props.onDelete({ id: this.props.comment.id })
  }

  handleEditShow = (bool) => () => {
    this.setState({ editing: bool })
  }

  handleEdit = (e) => {
    e.preventDefault()
    const title = e.target[0].value
    const text = e.target[1].value
    this.props.onEdit(this.props.comment.id, title, text)
    this.setState({ editing: false })
  }

  render () {
    const {
      comment,
      user,
      forum,
      topic
    } = this.props

    const commentLink = window.location.origin +
    urlBuilder.for('site.topic', {
      forum: forum.name,
      id: topic.id
    }) +
    `#comment-${comment.id}`

    if (user.state.pending) return null

    const { upvoted, downvoted } = (comment.currentUser || {})
    const userAttrs = user.state.value || {}
    const isOwner = userAttrs.id === comment.author.id

    if (this.state.overlayVisibility &&
        this.state.overlayActive === 'IS_SPAM') {
      return (
        <article
          className='comments-list-item is-spam'
          id={`comment-${comment.id}`}>
          <span>{t('comment-card.flagged-as-spam')}</span>
          {' '}
          <span className='show-spam btn-link' onClick={this.handleHideOverlay}>
            {t('comment-card.show')}
          </span>
        </article>
      )
    }

    return (
      <article className='comments-list-item' id={`comment-${comment.id}`}>
        <a name={`comment-${comment.id}`} />
        <CommentHeader
          comment={comment}
          isOwner={isOwner}
          onToggleOptionsMenu={this.handleToggleOptionsMenu}
          onEditShow={this.handleEditShow(true)}
          showOptionsMenu={this.state.showOptionsMenu}
          onToggleDeleteConfirmation={this.handleShowOverlay('CONFIRM_REMOVE')}
          user={user.state.value || null}
          forum={forum}
          flags={comment.flags}
          commentId={comment.id}
          onFlag={this.props.onFlag}
          onUnflag={this.props.onUnflag} />

        <CommentContent
          topic={topic}
          comment={comment}
          isOwner={isOwner}
          upvoted={upvoted}
          downvoted={downvoted}
          onUnvote={this.handleUnvote}
          onUpvote={this.handleUpvote}
          onDownvote={this.handleDownvote}
          editing={this.state.editing}
          onHandleEdit={this.handleEdit}
          handleHideEdit={this.handleEditShow(false)} />

        <CommentFooter
          topic={topic}
          comment={comment}
          commentLink={commentLink}
          isOwner={isOwner}
          upvoted={upvoted}
          downvoted={downvoted}
          onUnvote={this.handleUnvote}
          onUpvote={this.handleUpvote}
          onDownvote={this.handleDownvote}
          onToggleReplies={this.handleToggleReplies} />

        <CommentReplies
          topic={topic}
          commentId={comment.id}
          replies={comment.replies}
          forum={forum}
          topic={topic}
          user={user}
          repliesVisibility={this.state.repliesVisibility}
          onReply={this.props.onReply}
          onDeleteReply={this.props.onDeleteReply}
          onReplyEdit={this.props.onReplyEdit}
          commentsReplying={this.props.commentsReplying} />

        {
          this.state.overlayVisibility &&
          this.state.overlayActive === 'NEEDS_LOGIN' &&
          (
            <div className='comment-overlay' onClick={this.handleHideOverlay}>
              <NeedsLogin comment={comment} commentLink={commentLink} />
            </div>
          )
        }

        {
          this.state.overlayVisibility &&
          this.state.overlayActive === 'CONFIRM_REMOVE' &&
          (
            <div className='comment-overlay'>
              <p>{t('comments.arguments.confirm-remove')}</p>
              <div>
                <button
                  onClick={this.handleHideOverlay}
                  className='btn btn-sm btn-default'>
                  {t('common.cancel')}
                </button>
                <button
                  onClick={this.handleDelete}
                  className='btn btn-sm btn-danger'>
                  {t('common.ok')}
                </button>
              </div>
            </div>
          )
        }

        {
          this.state.overlayVisibility &&
          this.state.overlayActive === 'HAS_REPLIES_ERR' &&
          (
            <div className='comment-overlay'>
              <p>{t('comments.cannot-remove')}</p>
              <div>
                <button
                  onClick={this.handleHideOverlay}
                  className='btn btn-sm btn-default'>
                  {t('common.ok')}
                </button>
              </div>
            </div>
          )
        }
      </article>
    )
  }
}

export default userConnector(Comment)

function NeedsLogin ({ comment }, commentLink) {
  const ref = `${commentLink}-${comment.id}`

  return (
    <div className='needs-login'>
      {t('comments.sign-in-required')}.{' '}
      <Link to={{ pathname: '/signin', query: { ref } }}>
        {t('signin.login')}
      </Link>
      {' '}{t('common.or')}{' '}
      <Link to={{ pathname: '/signup', query: { ref } }}>
        {t('signin.signup')}
      </Link>
    </div>
  )
}
