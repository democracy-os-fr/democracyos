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

  const replyTooltip = (
    <Tooltip id='replyTooltip'>
      {t('comments.arguments.reply')}
    </Tooltip>
  )

  const facebookTooltip = (
    <Tooltip id='facebookTooltip'>
      {t('common.share.facebook')}
    </Tooltip>
  )

  const twitterTooltip = (
    <Tooltip id='twitterTooltip'>
      {t('common.share.twitter')}
    </Tooltip>
  )

  function computeContent () {
    return '"' + props.comment.title + '" - ' + props.comment.author.displayName
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
          <OverlayTrigger placement='left' overlay={facebookTooltip}>
            <a
              href={`http://www.facebook.com/sharer.php?u=${computeContent()}+${props.commentLink}`}
              target='_blank'
              rel='noopener noreferrer'
              className='icon-social-facebook' />
          </OverlayTrigger>
          <OverlayTrigger placement='left' overlay={twitterTooltip}>
            <a
              href={`http://twitter.com/share?text=${computeContent()}&url=${props.commentLink}`}
              target='_blank'
              rel='noopener noreferrer'
              className='icon-social-twitter' />
          </OverlayTrigger>
        </div>
        <OverlayTrigger placement='left' overlay={copyTooltip}>
          <CopyToClipboard text={props.commentLink}>
            <Button className='btn-xs' >
              <i className='fa fa-fw fa-link' />
            </Button>
          </CopyToClipboard>
        </OverlayTrigger>
        <OverlayTrigger placement='left' overlay={replyTooltip}>
          <Button className='reply'
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
            <span className='fa-stack fa-lg'>
              <i className='fa fa-circle fa-stack-2x' />
              <i className='fa fa-reply fa-flip-vertical fa-stack-1x fa-inverse' />
            </span>
          </Button>
        </OverlayTrigger>
      </div>
    </footer>
  )
}
