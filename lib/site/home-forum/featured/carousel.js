import React, { Component } from 'react'
import { Carousel } from 'react-bootstrap'
import isEmpty from 'mout/lang/isEmpty'
import request from 'lib/request/request.js'
import Comment from 'lib/site/topic-layout/topic-article/comments/list/comment/component'
import commentsConnector from './connector'

export class FeaturedCarousel extends Component {
  constructor (props) {
    super(props)

    this.state = {
      fetched: false,
      loading: false,
      error: false
    }
  }

  handleError = (e) => {
    console.error(e)
    this.setState({
      fetched: false,
      loading: false,
      error: true,
      comments: []
    })
  }

  componentWillMount () {
    const { forum, type } = this.props
    this.setState({ loading: true })
    request
    .post(`/api/v2/comments/${type}`)
    .query({
      forum: forum.id
    })
    .end((err, res) => {
      if (err || !res.ok || !res.body) {
        this.handleError(err)
      } else {
        const { comments } = res.body
        console.dir(comments)
        this.setState({
          fetched: !isEmpty(comments),
          loading: false,
          error: false,
          comments: comments || []
        })
      }
    })
  }

  componentWillUnmount () {}

  render () {
    let sectionClasses = ['featured-card']
    if (this.state.loading) {
      sectionClasses.push('loading')
    }

    return (
      <div className={sectionClasses.join(' ')}>
        {this.state.loading ? (
          <div className='loader-wrapper'>
            <div className='topic-loader' />
          </div>
        ) : (this.state.fetched && (
          <Carousel interval={null} slide >
            {this.state.comments.map((item) => {
              const handlers = {
                onUnvote: () => this.props.handleUnvote(item.id),
                onUpvote: () => this.props.handleUpvote(item.id),
                onDownvote: () => this.props.handleDownvote(item.id),
                onFlag: () => this.props.handleFlag(item.id),
                onUnflag: () => this.props.handleUnflag(item.id)
              }

              return (
                <Carousel.Item key={item.id} animateIn animateOut>

                  <div className='topic-header'>
                    <b>{item.topic.mediaTitle}</b>
                  </div>

                  <Comment
                    comment={item}

                    onReply={this.props.handleReply}
                    commentsReplying={this.props.commentsReplying}
                    onDelete={this.props.handleDelete}
                    onDeleteReply={this.props.handleDeleteReply}
                    commentDeleting={this.props.commentDeleting}
                    onReplyEdit={this.props.handleReplyEdit}
                    onEdit={this.props.handleEdit}

                    {...handlers}

                    showReplies={false}

                    forum={this.props.forum}
                    topic={item.topic} />
                </Carousel.Item>
              )
            })}
          </Carousel>
        ))}
      </div>
    )
  }
}

export default commentsConnector(FeaturedCarousel)
