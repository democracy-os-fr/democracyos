import React from 'react'
import RepliesForm from './form/component'
import RepliesList from './list/component'

export default function CommentReplies (props) {
  if (!props.repliesVisibility) return null

  return (
    <div className='comments-replies-container'>
      <RepliesList
        topic={props.topic}
        onDeleteReply={props.onDeleteReply}
        commentId={props.commentId}
        replies={props.replies}
        onReplyEdit={props.onReplyEdit}
        forum={props.forum}
        user={props.user} />
      <RepliesForm
        topic={props.topic}
        commentId={props.commentId}
        onSubmit={props.onReply}
        commentsReplying={props.commentsReplying} />
    </div>
  )
}
