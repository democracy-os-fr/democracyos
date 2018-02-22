import React, { Component } from 'react'
import t from 't-component'
import config from 'lib/config/config'
import AutoGrowTextarea from 'lib/site/topic-layout/topic-article/comments/form/autogrow-textarea'

export default class CommentContent extends Component {
  constructor (props) {
    super(props)
    this.state = {
      readMore: false,
      enabled: false
    }
    this.toggleReadMore = this.toggleReadMore.bind(this)
  }

  componentDidMount () {
    this.setState({ enabled: this.refs.text.offsetHeight !== this.refs.text.scrollHeight })
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
        { this.props.commentTitle && (
          <h1 className='title'>{this.props.commentTitle}</h1>
        )}
        <div
          ref='text'
          className='text'
          dangerouslySetInnerHTML={{ __html: this.props.textHtml }} />
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
            defaultValue={this.props.commentTitle}
            placeholder={t('comments.title.placeholder')} />
          <AutoGrowTextarea
            className='comments-edit'
            autoFocus
            defaultValue={this.props.text}
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
