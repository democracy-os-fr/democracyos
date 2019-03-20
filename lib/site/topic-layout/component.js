import React, { Component } from 'react'
import { browserHistory, withRouter } from 'react-router'
import t from 't-component'
import config from 'lib/config'
import forumStore from 'lib/stores/forum-store/forum-store'
import topicStore from 'lib/stores/topic-store/topic-store'
import userConnector from 'lib/site/connectors/user'
import topicConnector from 'lib/site/connectors/topic'
import Sidebar from './sidebar/component'
import TopicArticle from './topic-article/component'

export class TopicLayout extends Component {
  constructor (props) {
    super(props)
    this.state = {
      topics: null,
      forum: null
    }
    this.canLeave = true

    this.props.router.setRouteLeaveHook(this.props.route, (location) => {
      if (this.props.topic && (this.props.topic.action.method === 'poll') && !this.canLeave) {
        return t('proposal-article.warning.leaving-without-vote')
      } else {
        return true
      }
    })
  }

  componentDidMount () {
    let name = this.props.params.forum

    if (!name && !config.multiForum) {
      name = config.defaultForum
    }

    forumStore.findOneByName(name)
      .then((forum) => Promise.all([
        forum,
        topicStore.findAll({ forum: forum.id })
      ]))
      .then(([forum, [ topics, pagination ]]) => {
        this.setState({
          forum,
          topics
        })
      })
      .catch((err) => {
        if (err.status === 404) {
          window.location = '/404'
          return
        }
        if (err.status === 403) {
          window.location = `/signin?ref=${window.location.pathname}`
          return
        }
        if (err.status === 401) {
          window.location = '/401'
          return
        }

        throw err
      })
  }

  handleCanLeave = (state) => {
    this.canLeave = state
  }

  render () {
    if (config.visibility === 'hidden' && this.props.user.state.rejected) {
      browserHistory.push(`/signin`)
      return null
    }

    const { topic, route } = this.props
    const { forum, topics } = this.state

    return (
      <div id='topic-wrapper'>
        <Sidebar topics={topics} activeTopic={topic} handleCanLeave={this.handleCanLeave} />
        {forum && topic && (
          <TopicArticle topic={topic} forum={forum} route={route} handleCanLeave={this.handleCanLeave} />
        )}
      </div>
    )
  }
}

export default withRouter(userConnector(topicConnector(TopicLayout)))
