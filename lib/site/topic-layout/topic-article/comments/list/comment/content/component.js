import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import t from 't-component'
import config from 'lib/config/config'
import AutoGrowTextarea from 'lib/site/topic-layout/topic-article/comments/form/autogrow-textarea'
import CommentRef from './comment-ref/component'

export default class CommentContent extends Component {
  constructor (props) {
    super(props)
    this.state = {
      readMore: false,
      enabled: false
    }
    this.toggleReadMore = this.toggleReadMore.bind(this)
  }

  handleUpdate = () => {
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

  componentDidMount () {
    this.handleUpdate()
    if (this.text) { this.setState({ enabled: this.text.offsetHeight !== this.text.scrollHeight }) }
  }

  componentDidUpdate () {
    this.handleUpdate()
  }

  toggleReadMore () {
    const currentState = this.state.readMore
    this.setState({ readMore: !currentState })
  }

  render () {
    let commentsLength = config.maxCommentsLength
    if (this.props.topic.attrs && this.props.topic.attrs.commentsLength) {
      commentsLength = this.props.topic.attrs.commentsLength
    }

    let Content = (
      <div className={`read-more ${this.state.readMore ? 'on' : 'off'}`}>
        { this.props.comment.title && (
          <h1 className='title'>{this.props.comment.title}</h1>
        )}
        <div
          ref={(text) => { this.text = text }}
          className='text'
          dangerouslySetInnerHTML={{ __html: this.props.comment.textHtml }} />
        <div className={`action ${this.state.enabled ? '' : 'hidden'}`}>
          <button
            onClick={this.toggleReadMore}
            className='btn btn-sm btn-link more'
            title={t('common.read-more')}>
            <i className='icon-arrow-down' />
          </button>
          <button
            onClick={this.toggleReadMore}
            className='btn btn-sm btn-link less'
            title={t('common.read-less')} >
            <i className='icon-arrow-up' />
          </button>
        </div>
      </div>
    )

    if (this.state.readMore) {
      Content = (
        <div className='content-with-actions'>
          <div className='actions'>
            <div className='votes'>
              <button
                className={`btn btn-xs upvote ${this.props.upvoted ? 'active' : ''} ${this.props.isOwner ? 'disabled' : ''}`}
                disabled={this.props.isOwner}
                onClick={this.props.upvoted ? this.props.onUnvote : this.props.onUpvote}>
                {t('proposal-options.yea')}
                <span className='score'>{this.props.comment.upscore}</span>
              </button>
              <button
                className={`btn btn-xs downvote ${this.props.downvoted ? 'active' : ''} ${this.props.isOwner ? 'disabled' : ''}`}
                disabled={this.props.isOwner}
                onClick={this.props.downvoted ? this.props.onUnvote : this.props.onDownvote}>
                {t('proposal-options.nay')}
                <span className='score'>{this.props.comment.downscore}</span>
              </button>
            </div>
          </div>
          {Content}
        </div>
      )
    }

    if (this.props.isOwner && this.props.editing) {
      Content = (
        <form
          className='edit-form'
          onSubmit={this.props.onHandleEdit}>
          <input
            type='text'
            className='form-control comment-title'
            id='title'
            name='title'
            maxLength='1024'
            defaultValue={this.props.comment.title}
            placeholder={t('comments.title.placeholder')}
            required='required' />
          <AutoGrowTextarea
            className='comments-edit'
            autoFocus
            defaultValue={this.props.comment.text}
            maxLength={commentsLength}
            minLength='1'
            wrap='soft' />
          <button
            type='submit'
            className='btn btn-sm btn-success'>
            {t('common.ok')}
          </button>
          <button
            type='button'
            onClick={this.props.handleHideEdit}
            className='btn btn-sm btn-default'>
            {t('common.cancel')}
          </button>
        </form>
      )
    }

    return Content
  }
}
