import React, { Component } from 'react'
import { Carousel } from 'react-bootstrap'
import t from 't-component'
import isEmpty from 'mout/lang/isEmpty'
import request from 'lib/request/request.js'
import Comment from 'lib/site/topic-layout/topic-article/comments/list/comment/component'

export default class FeaturedSection extends Component {
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
    const { forum } = this.props
    this.setState({ loading: true })
    console.log('componentWillMount')
    request
    .get('/api/v2/comments/last')
    .query({
      type: 'voted',
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
    let sectionClasses = ['featured']
    if (this.state.loading) {
      sectionClasses.push('loading')
    }

    return (
      <section className={sectionClasses.join(' ')}>
        {this.state.loading ? (
          <div className='loader-wrapper'>
            <div className='topic-loader' />
          </div>
        ) : (this.state.fetched && (
          <div className='featured-card'>
            <Carousel interval={null} >
              {this.state.comments.map((item) => {
                return (
                  <Carousel.Item animateIn={false} animateOut={false}>
                    <Comment
                      key={item.id}
                      comment={item}
                      onReply={() => { console.log('-- onReply --') }}
                      onEdit={() => { console.log('-- onEdit --') }}
                      onReplyEdit={() => { console.log('-- onReplyEdit --') }}
                      onDelete={() => { console.log('-- onDelete --') }}
                      onDeleteReply={() => { console.log('-- onDeleteReply --') }}
                      onUnvote={() => { console.log('-- onUnvote --') }}
                      onUpvote={() => { console.log('-- onUpvote --') }}
                      onDownvote={() => { console.log('-- onDownvote --') }}
                      onFlag={() => { console.log('-- onFlag --') }}
                      onUnflag={() => { console.log('-- onUnflag --') }}
                      commentsReplying={false}
                      showReplies={false}
                      commentDeleting={false}
                      forum={this.props.forum}
                      topic={item.topic} />
                  </Carousel.Item>
                )
              })}
            </Carousel>
          </div>
        ))}
      </section>
    )
  }
}
