import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import t from 't-component'
import config from 'lib/config/config'
import AutoGrowTextarea from 'lib/site/topic-layout/topic-article/comments/form/autogrow-textarea'
import CommentRef from 'lib/site/topic-layout/topic-article/comments/list/comment/content/comment-ref/component'

export default class CommentContent extends Component {
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
  }

  componentDidUpdate () {
    this.handleUpdate()
  }

  render () {
    let commentsLength = config.maxCommentsLength
    if (this.props.topic.attrs && this.props.topic.attrs.commentsLength) {
      commentsLength = this.props.topic.attrs.commentsLength
    }
    let Content = (
      <div
        ref={(text) => { this.text = text }}
        className='text'
        dangerouslySetInnerHTML={{ __html: this.props.textHtml }} />
  )

    if (this.props.isOwner && this.props.editing) {
      Content = (
        <form
          className='edit-form'
          onSubmit={this.props.onHandleEdit}>
          <AutoGrowTextarea
            autoFocus
            defaultValue={this.props.text}
            maxLength={commentsLength}
            minLength='1' />
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
