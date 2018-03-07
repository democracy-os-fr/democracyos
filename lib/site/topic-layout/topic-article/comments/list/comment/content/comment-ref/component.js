import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { OverlayTrigger, Popover } from 'react-bootstrap'
import t from 't-component'
import urlBuilder from 'lib/url-builder'
import request from 'lib/request/request.js'
import Timeago from 'lib/site/timeago'
import parseComment from '../../../../parse-comment'

export default class CommentRef extends Component {
  constructor (props) {
    super(props)

    this.state = {
      fetched: false,
      error: false,
      comment: null,
      topic: null
    }
  }

  handleError = (e) => {
    console.error(e)
    this.setState({
      fetched: false,
      error: true
    })
  }

  handleShow = () => {
    if (this.state.fetched) {
      if (this.text) {
        let commentsLinks = this.text.querySelectorAll('span[data-ref][data-type="comment"]')
        if (commentsLinks && commentsLinks.length > 0) {
          for (let comment of commentsLinks.values()) {
            const ref = comment.getAttribute('data-ref')
            ReactDOM.render((
              <CommentRef commentId={ref} />
            ), comment)
          }
        }
      }
    }
  }

  componentWillMount () {
    request
    .get('/api/v2/comment/' + this.props.commentId)
    .end((err, res) => {
      if (err || !res.ok || !res.body || !res.body.comment) {
        this.handleError(err)
      } else {
        parseComment(res.body.comment)
        .then((comment) => {
          this.setState({
            comment: comment,
            topic: res.body.topic,
            fetched: true
          })
        })
        .catch((err) => {
          this.handleError(err)
        })
      }
    })
  }

  render () {
    if (this.state.fetched) {
      const { comment, topic } = this.state

      const commentLink = window.location.origin +
        urlBuilder.for('site.topic', {
          forum: topic.forum.name,
          id: topic.id
        }) +
        `#comment-${this.state.comment.id}`

      const commentPopover = (
        <Popover id={'comment-ref-' + this.props.commentId} className='popover-comment'>
          <div className='text'
            ref={(text) => { this.text = text }}
            dangerouslySetInnerHTML={{ __html: comment.textHtml }} />
          <footer className={`meta ${comment.author.badge ? ' has-badge' : ''}`}>
            <img
              className='avatar'
              src={comment.author.avatar}
              alt={comment.author.fullName} />
            <h3 className='name'>
              {comment.author.displayName}
              <div className='created-at'>
                <Timeago date={comment.createdAt} />
              </div>
              {
                comment.author.badge && (
                  <span className='valid-badge'>{comment.author.badge}</span>
                )
              }
            </h3>
            <div className='options'>
              <a href={commentLink}
                className='comment-link'
                title={t('comments.arguments.view')}>
                <i className='fa fa-fw fa-external-link' />
              </a>
            </div>
          </footer>
        </Popover>

      )

      return (
        <OverlayTrigger
          trigger='click' rootClose
          placement='bottom'
          overlay={commentPopover}
          onEntering={this.handleShow} >
          <span className='comment-ref fetched' tabIndex={0}>
            <i className='fa fa-fw fa-comment-o' />
            {comment.title}
          </span>
        </OverlayTrigger>
      )
    } else {
      return (
        <span className='comment-ref'>
          <i className='fa fa-hashtag' />
          {this.state.error ? (
            <i className='fa fa-refresh fa-warning text-danger' />
          ) : (
            <i className='fa fa-refresh fa-spin' />
          )}
        </span>
      )
    }
  }
}
