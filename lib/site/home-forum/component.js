import React, { Component } from 'react'
import { Link, browserHistory } from 'react-router'
import t from 't-component'
import isEmpty from 'mout/lang/isEmpty'
import contains from 'mout/array/contains'
import has from 'mout/object/has'
import urlBuilder from 'lib/url-builder'
import sort from 'lib/sorts/topic'
import config from 'lib/config'
import checkReservedNames from 'lib/forum/check-reserved-names'
import forumStore from 'lib/stores/forum-store/forum-store'
import topicStore from 'lib/stores/topic-store/topic-store'
import userConnector from 'lib/site/connectors/user'
import TopicCard from './topic-card/component'
import FeaturedSection from './featured/section'

function hasComments (topics) {
  if (!isEmpty(topics)) {
    for (var i = 0; i < topics.length; i++) {
      if (has(topics[i], 'count.replies') && topics[i].count.replies) {
        return true
      }
    }
  }
  return false
}

export class HomeForum extends Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: null,
      topics: [],
      forum: null,
      hasComments: false
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
          topics: sort(topics, config.sorts.home.default),
          hasComments: hasComments(topics)
        })
      })
      .catch((err) => {
        if (err.status === 404) return browserHistory.push('/404')
        if (err.status === 403) return browserHistory.push('/401')
        if (err.status === 401) return browserHistory.push(`/signin?ref=${window.location.pathname}`)
        throw err
      })
  }

  render () {
    const user = this.props.user.state.value || {}
    const canManage = user.privileges && user.privileges.canManage
    const { forum, topics } = this.state

    if (!forum) return null
    const canCreate = forum.privileges.canCreateTopics

    if (
      ((config.visibility === 'hidden') || contains(['private', 'closed'], forum.visibility)) &&
      (this.props.user.state.rejected || !(user && user.privileges && user.privileges.canView))
    ) {
      browserHistory.push(`/signin?ref=${window.location.pathname}`)
      return null
    }

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
              (canCreate) &&
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
        {this.state.loading ? (
          <div className='loader-wrapper'>
            <div className='topic-loader' />
          </div>
        ) : (
          <div>
            {config.featuredSection && forum.featuredSection && this.state.hasComments && (
              <FeaturedSection forum={forum} />
            )}
            <div className='topics-container'>
              {topics.map((topic) => (
                <TopicCard key={topic.id} topic={topic} />
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }
}

export default userConnector(HomeForum)
