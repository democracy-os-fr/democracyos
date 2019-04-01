import React, { Component } from 'react'
import { Link } from 'react-router'
import bus from 'bus'
import t from 't-component'
import urlBuilder from 'lib/url-builder'
import userConnector from 'lib/site/connectors/user'
import Header from './header/component'
import Content from './content/component'
import Footer from './footer/component'
import Social from './social/component'
import Vote from './vote/component'
import Poll from './poll/component'
import Cause from './cause/component'
import Comments from './comments/component'
import AdminActions from './admin-actions/component'

class TopicArticle extends Component {
  constructor (props) {
    super(props)
    this.state = {
      showSidebar: false,
      showModal: false,
      keepSelection: false
    }
  }

  componentWillMount () {
    bus.on('sidebar:show', this.toggleSidebar)
  }

  componentWillReceiveProps (props) {
    if (props.topic.attrs && props.topic.attrs.polisID) {
      const script = document.createElement('script')

      script.src = 'https://pol.is/embed.js'
      script.async = true

      document.body.appendChild(script)
    }
    this.setState({ keepSelection: false })
  }

  componentWillUnmount () {
    bus.off('sidebar:show', this.toggleSidebar)
  }

  toggleSidebar = (bool) => {
    this.setState({
      showSidebar: bool,
      keepSelection: true
    })
  }

  handleCreateTopic = () => {
    window.location = urlBuilder.for('admin.topics.create', {
      forum: this.props.forum.name
    })
  }

  render () {
    const {
      topic,
      forum,
      user
    } = this.props

    const userAttrs = user.state.fulfilled && (user.state.value || {})
    const canCreateTopics = userAttrs.privileges &&
      userAttrs.privileges.canManage &&
      forum &&
      forum.privileges &&
      forum.privileges.canChangeTopics

    if (!topic) {
      return (
        <div className='no-topics'>
          <p>{t('homepage.no-topics')}</p>
          {
            canCreateTopics && (
              <button
                className='btn btn-primary'
                onClick={this.handleCreateTopic} >
                {t('homepage.create-debate')}
              </button>
            )
          }
        </div>
      )
    }

    let action = (<div className='topic-article-content' />)
    if (topic.action.method) {
      switch (topic.action.method) {
        case 'vote':
          action = (
            <Vote
              topic={topic}
              canVoteAndComment={forum.privileges.canVoteAndComment} />
          )
          break
        case 'poll':
          action = (
            <div className='topic-article-content'>
              <Poll
                topic={topic}
                keepSelection={this.state.keepSelection}
                canVoteAndComment={forum.privileges.canVoteAndComment}
                handleCanLeave={this.props.handleCanLeave} />
            </div>
          )
          break
        case 'cause':
          action = (
            <div className='topic-article-content'>
              <Cause
                topic={topic}
                canVoteAndComment={forum.privileges.canVoteAndComment} />
            </div>
          )
          break
      }
    }

    let showComments = !user.state.pending && !(topic.attrs && topic.attrs.disableComments)
    let showPolisComments = topic.attrs && topic.attrs.polisID
    let nextTopic = topic.attrs && topic.attrs.nextTopic

    return (
      <div className='topic-article-wrapper'>
        {
          this.state.showSidebar &&
            <div onClick={hideSidebar} className='topic-overlay' />
        }
        <AdminActions forum={forum} topic={topic} />
        <Header
          closingAt={topic.closingAt}
          closed={topic.closed}
          author={topic.author}
          authorUrl={topic.authorUrl}
          tags={topic.tags}
          forumName={forum.name}
          mediaTitle={topic.mediaTitle} />
        {topic.clauses && <Content clauses={topic.clauses} />}
        {
          topic.links && (
            <Footer
              source={topic.source}
              links={topic.links}
              socialUrl={topic.url}
              title={topic.mediaTitle} />
          )
        }
        {action}
        <Social forum={forum} topic={topic} />
        {nextTopic && (
          <div className='topic-article-content topic-social'>
            <Link className='btn btn-default btn-block btn-next'
              to={nextTopic}
              ref={(nextLink) => { this.nextLink = nextLink }}>
              { topic.attrs.nextTopicLabel ? topic.attrs.nextTopicLabel : t('proposal-article.next') }
              <i className='fa fa-arrow-circle-right' aria-hidden='true' />
            </Link>
          </div>
        )}
        { showComments && <Comments forum={forum} topic={topic} readOnly={topic.closed} /> }
        { showPolisComments && (
          <div
            className='polis'
            data-page_id={topic.id}
            data-site_id={topic.attrs.polisID}
            data-ucw='true' data-ucv='true' data-show_vis='false' data-border='none' />
        )}
        { !(showComments || showPolisComments) && (<div className='topic-bottom-spacer' />) }
      </div>
    )
  }
}

export default userConnector(TopicArticle)

function hideSidebar () {
  bus.emit('sidebar:show', false)
}
