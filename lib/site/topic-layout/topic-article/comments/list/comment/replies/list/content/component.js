import React from 'react'
import t from 't-component'
import config from 'lib/config/config'
import AutoGrowTextarea from 'lib/site/topic-layout/topic-article/comments/form/autogrow-textarea'

export default function ReplyContent (props) {
  let commentsLength = config.maxCommentsLength
  if (props.topic.attrs && props.topic.attrs.commentsLength) {
    commentsLength = props.topic.attrs.commentsLength
  }
  let Content = (
    <div
      className='text'
      dangerouslySetInnerHTML={{ __html: props.textHtml }} />
  )

  if (props.isOwner && props.editing) {
    Content = (
      <form
        className='edit-form'
        onSubmit={props.onHandleEdit}>
        <AutoGrowTextarea
          autoFocus
          defaultValue={props.text}
          maxLength={commentsLength}
          minLength='1' />
        <button
          type='submit'
          className='btn btn-sm btn-success'>
          {t('common.ok')}
        </button>
        <button
          type='button'
          onClick={props.handleHideEdit}
          className='btn btn-sm btn-default'>
          {t('common.cancel')}
        </button>
      </form>
    )
  }

  return Content
}
