import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import t from 't-component'
import config from 'lib/config'
import Comment from './comment/component'

export default class CommentsList extends Component {
  constructor (props) {
    super(props)

    this.state = {
      showReplies: config.showReplies
    }
  }

  handleToggleAllReplies = () => {
    console.log('handleToggleAllReplies')
    this.setState({ showReplies: !this.state.showReplies })
  }

  render () {
    const comments = this.props.comments || []

    return (
      <div>
        <div className='list-actions'>
          <Button bsStyle='link' bsSize='xsmall' onClick={this.handleToggleAllReplies}>
            {t('comments.arguments.replies')}
            <i className='fa fa-reply-all fa-flip-vertical' />
          </Button>
        </div>
        <div
          className={`comments-list${this.props.loading ? ' loading' : ''}`}>
          {
            comments.map((item) => {
              const handlers = {
                onUnvote: () => this.props.onUnvote(item.id),
                onUpvote: () => this.props.onUpvote(item.id),
                onDownvote: () => this.props.onDownvote(item.id),
                onFlag: () => this.props.onFlag(item.id),
                onUnflag: () => this.props.onUnflag(item.id)
              }

              return (
                <Comment
                  key={item.id}
                  comment={item}
                  onReply={this.props.onReply}
                  commentsReplying={this.props.commentsReplying}
                  onEdit={this.props.onEdit}
                  onReplyEdit={this.props.onReplyEdit}
                  onDelete={this.props.onDelete}
                  onDeleteReply={this.props.onDeleteReply}
                  showReplies={this.state.showReplies}
                  commentDeleting={this.props.commentDeleting}
                  {...handlers}
                  forum={this.props.forum}
                  topic={this.props.topic} />
              )
            })
          }
        </div>
      </div>

    )
  }
}
