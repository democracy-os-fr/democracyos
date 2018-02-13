import React, { Component } from 'react'
import { Link, browserHistory } from 'react-router'
import t from 't-component'
import urlBuilder from 'lib/url-builder'
import sort from 'lib/sorts/topic'
import config from 'lib/config'
import checkReservedNames from 'lib/forum/check-reserved-names'
import forumStore from 'lib/stores/forum-store/forum-store'
import topicStore from 'lib/stores/topic-store/topic-store'
import userConnector from 'lib/site/connectors/user'
import TopicCard from './topic-card/component'

export class HomeForum extends Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: null,
      topics: [],
      forum: null
    }
  }

  componentWillMount () {
    if (!config.multiForum && !config.defaultForum) {
      window.location = urlBuilder.for('forums.new')
    }

    let name = this.props.params.forum

    if (!name && !config.multiForum) {
      name = config.defaultForum
    }

    checkReservedNames(name)
    this.setState({ loading: true })

    var u = new window.URLSearchParams(window.location.search)
    let query = {}

    forumStore.findOneByName(name)
      .then((forum) => {
        query.forum = forum.id
        if (u.has('tag')) query.tag = u.get('tag')
        return Promise.all([
          forum,
          topicStore.findAll(query)
        ])
      })
      .then(([forum, [ topics, pagination ]]) => {
        this.setState({
          loading: false,
          forum,
          topics: sort(topics, config.sorts.home.default)
        })
      })
      .catch((err) => {
        if (err.status === 404) return browserHistory.push('/404')
        if (err.status === 401) return browserHistory.push('/401')
        throw err
      })
  }

  render () {
    const user = this.props.user.state.value || {}
    const canManage = user.privileges && user.privileges.canManage
    if (config.visibility === 'hidden' && this.props.user.state.rejected) {
      browserHistory.push('/signin')
      return null
    }

    if (!this.state.forum) return null

    const { forum, topics } = this.state

    const cover = (forum.coverUrl && {
      backgroundImage: 'linear-gradient(rgba(0,0,0, 0.6), rgba(0,0,0, 0.6)), url("' + forum.coverUrl + '")'
    }) || null

    return (
      <div id='forum-home'>
        <div
          className={'cover' + (forum.coverUrl ? '' : ' no-img')}
          style={cover}>
          <div className='cover-content'>
            <h1>
              {forum.title}
              {(canManage) && (
                <Link
                  to={urlBuilder.for('admin', {
                    forum: forum.name
                  })}
                  className='admin'
                  title={t('newsfeed.call-to-action.manage-forums')}>
                  <i className='fa fa-fw fa-wrench' />
                </Link>
              )}
            </h1>
            <p>{forum.summary}</p>
            {
              forum.privileges.canCreateTopics &&
                <a
                  href={urlBuilder.for('admin.topics.create', {
                    forum: forum.name
                  })}
                  className='btn btn-primary'>
                  {t('proposal-article.create')}
                </a>
            }
          </div>
        </div>
        {topics.length === 0 && (
          <div className='no-topics'>
            <p>{t('homepage.no-topics')}</p>
          </div>
        )}
        <div className='topics-container'>
          {this.state.loading && (
            <div className='loader-wrapper'>
              <div className='topic-loader' />
            </div>
          )}
          {topics.map((topic) => (
            <TopicCard key={topic.id} topic={topic} />
          ))}
        </div>
      </div>
    )
  }
}

export default userConnector(HomeForum)
