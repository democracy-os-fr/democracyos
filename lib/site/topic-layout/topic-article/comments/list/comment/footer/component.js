import React from 'react'
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap'
import t from 't-component'
import { CopyToClipboard } from 'react-copy-to-clipboard'

export default function CommentFooter (props) {
  const refTooltip = (
    <Tooltip id='copyTooltip'>
      {t('common.copy.ref')}
    </Tooltip>
  )

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
        <button
          className={`btn btn-xs upvote ${props.upvoted ? 'active' : ''} ${props.isOwner ? 'disabled' : ''}`}
          disabled={props.isOwner}
          onClick={props.upvoted ? props.onUnvote : props.onUpvote}>
          {t('proposal-options.yea')}
          <span className='score'>{props.comment.upscore}</span>
        </button>
        <button
          className={`btn btn-xs downvote ${props.downvoted ? 'active' : ''} ${props.isOwner ? 'disabled' : ''}`}
          disabled={props.isOwner}
          onClick={props.downvoted ? props.onUnvote : props.onDownvote}>
          {t('proposal-options.nay')}
          <span className='score'>{props.comment.downscore}</span>
        </button>
      </div>
      <div className='replies-score'>
        <div className='share-links'>
          <OverlayTrigger placement='left' overlay={facebookTooltip}>
            <a
              href={`http://www.facebook.com/sharer.php?u=${props.commentLink}`}
              target='_blank'
              rel='noopener noreferrer'
              className='icon-social-facebook' />
          </OverlayTrigger>
          <OverlayTrigger placement='left' overlay={twitterTooltip}>
            <a
              href={`http://twitter.com/share?text=${computeContent().substring(0, 140)}&url=${props.commentLink}`}
              target='_blank'
              rel='noopener noreferrer'
              className='icon-social-twitter' />
          </OverlayTrigger>
        </div>
        <OverlayTrigger placement='left' overlay={refTooltip}>
          <CopyToClipboard text={`#${props.comment.id}`}>
            <Button className='btn-xs' >
              <i className='fa fa-fw fa-hashtag' />
            </Button>
          </CopyToClipboard>
        </OverlayTrigger>
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
              <span className='counter'>
                <span>
                  {props.comment.repliesCount}
                </span>
                &nbsp;
                <span>
                  { props.comment.repliesCount === 1 ? t('comments.reply') : t('comments.replies') }
                </span>
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
