import React from 'react'
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap'
import t from 't-component'
import { CopyToClipboard } from 'react-copy-to-clipboard'

export default function CommentFooter (props) {
  const copyTooltip = (
    <Tooltip id='copyTooltip'>
      {t('common.copy.link')}
    </Tooltip>
  )

  function computeContent() {
    return '"'+ props.comment.text +'" - '+ props.comment.author.displayName;
  }

  return (
    <footer className='actions'>
      <div className='votes'>
        <span className='score'>
          <span>{props.comment.score}</span>
          {' '}
        </span>
        {!props.isOwner && (
          <button
            className={`upvote ${props.upvoted ? 'active' : ''}`}
            onClick={props.upvoted ? props.onUnvote : props.onUpvote}>
            <i className='icon-like' />
          </button>
        )}
        {!props.isOwner && (
          <button
            className={`downvote ${props.downvoted ? 'active' : ''}`}
            onClick={props.downvoted ? props.onUnvote : props.onDownvote}>
            <i className='icon-dislike' />
          </button>
        )}
      </div>
      <div className='replies-score'>
        <div className='share-links'>
          <a
            href={`http://www.facebook.com/sharer.php?u=${computeContent() props.commentLink}`}
            target='_blank'
            rel='noopener noreferrer'
            className='icon-social-facebook' />
          <a
            href={`http://twitter.com/share?text=${computeContent()}&url=${props.commentLink}`}
            target='_blank'
            rel='noopener noreferrer'
            className='icon-social-twitter' />
        </div>
        <OverlayTrigger placement='left' overlay={copyTooltip}>
          <CopyToClipboard text={props.commentLink}>
            <Button className='btn-xs' >
              <i className='fa fa-fw fa-link' />
            </Button>
          </CopyToClipboard>
        </OverlayTrigger>

        <button
          className='reply'
          title={t('comments.arguments.reply')}
          onClick={props.onToggleReplies}>
          {
            !!props.comment.repliesCount &&
            (
              <span className='score'>
                <span>{props.comment.repliesCount}</span>
                {' '}
                <small>
                  {
                    props.comment.repliesCount === 1 ? t('comments.reply') : t('comments.replies')
                  }
                </small>
              </span>
            )
          }
          <i className='icon-action-redo' />
        </button>
      </div>
    </footer>
  )
}
