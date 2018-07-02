import React, { Component } from 'react'
import PropTypes from 'prop-types'
import t from 't-component'
import { Link } from 'react-router'
import { Carousel, Button } from 'react-bootstrap'
import isEmpty from 'mout/lang/isEmpty'
import Comment from 'lib/site/topic-layout/topic-article/comments/list/comment/component'
import connector from './connector'

export class FeaturedCarousel extends Component {
  constructor (props) {
    super(props)

    this.state = {
      comments: props.commentsFetch.value,
      pagination: props.commentsFetch.meta.pagination,
      fetched: false,
      loading: false,
      error: false
    }
  }

  componentWillReceiveProps ({ commentsFetch }) {
    if (!commentsFetch.pending) {
      this.setState({
        comments: commentsFetch.value,
        pagination: commentsFetch.meta.pagination,
        fetched: !isEmpty(commentsFetch.value),
        loading: false
      })
    } else {
      this.setState({ loading: commentsFetch.pending })
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
    const { commentsFetch } = this.props
    this.setState({ loading: commentsFetch.pending })
  }

  componentWillUnmount () {}

  render () {
    let sectionClasses = ['featured-card']
    if (this.state.loading) {
      sectionClasses.push('loading')
    }

    return (
      <div className={sectionClasses.join(' ')}>
        {this.state.loading && (
          <div className='loader-wrapper'>
            <div className='topic-loader' />
          </div>
        )}
        {this.state.fetched && (
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

                  <Link to={item.topic.url}>
                    <div className='topic-header clearfix'>
                      <b>{item.topic.mediaTitle}</b>
                      <div className='indicators'>
                        <button className='btn btn-sm btn-link'>{t('homepage.featured.button.topic')}</button>
                        <i className='fa fa-arrow-right' />
                      </div>
                    </div>
                  </Link>
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
        )}
        {!this.state.loading && !this.state.fetched && !this.state.error && isEmpty(this.state.comments) && (
          <div className='alert alert-warning' role='alert'>
            {t('homepage.featured.' + this.props.type + '.empty')}
          </div>
        )}
        {this.state.error && (
          <div className='alert alert-danger' role='alert'>
            {t('modals.error.default')}
          </div>
        )}
        {this.props.withReload && (
          <div className='bottom-actions'>
            <Button
              bsStyle='link' bsSize='small' className='highlight pull-right'
              disabled={this.state.loading}
              onClick={!this.state.loading ? this.props.handleRefresh : null} >
              {t('homepage.featured.button.refresh')}
            </Button>
          </div>
        )}
      </div>
    )
  }
}

FeaturedCarousel.propTypes = {
  forum: PropTypes.object.isRequired,
  withReload: PropTypes.bool
}

FeaturedCarousel.defaultProps = {
  withReload: false
}

export default connector(FeaturedCarousel)
