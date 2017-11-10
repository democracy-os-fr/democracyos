import React, { Component } from 'react'
import { Link } from 'react-router'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import t from 't-component'
import guid from 'mout/random/guid'
import request from 'lib/request/request.js'
import config from 'lib/config'
import Icon from 'lib/common/icon'
import topicStore from 'lib/stores/topic-store/topic-store'

export default class TopicCard extends Component {
  constructor (props) {
    super(props)

    this.state = {
      showResults: false,
      stats: {
        details: {},
        topics: {},
        comments: {},
        votes: {},
        users: {}
      },
      loading: !config.sharedMongo
    }
  }

  componentWillMount () {
    this.setState({ loading: true })
    if (!config.sharedMongo) {
      this.displayStats()
    }
  }

  displayStats = () => {
    const { topic } = this.props
    request
    .get('/api/stats/topic/' + topic.id)
    .end((err, res) => {
      if (err || !res.ok) {
        this.handleError([err || res.text])
      }
      this.setState({
        showResults: topic.closed,
        stats: res.body,
        loading: false
      })
    })
  }

  handleError = (err) => {
    console.log(err)
  }

  render () {
    const { topic } = this.props
    const { showResults } = this.state
    const showComments = !topic.attrs || !topic.attrs.disableComments

    let loading = (<i className='fa fa-spinner fa-spin fa-fw' />)

    let participants = this.state.loading ? loading : (
      <div className='participants-item'>
        <Icon keyName='common.users' tooltip />
        &nbsp;
        {showComments ? this.state.stats.participants : this.state.stats.votes.authors}
      </div>
    )

    let votes = this.state.loading ? loading : (
      <div className='participants-item'>
        <Icon keyName='common.votes' tooltip />
        &nbsp;
        {this.state.stats.votes.all}
      </div>
    )

    let comments = this.state.loading ? loading : (
      <div className='participants-item'>
        <Icon keyName='common.comments' tooltip />
        &nbsp;
        {this.state.stats.comments.all}
      </div>
    )

    let tooltipRatings = (<Tooltip id={`tooltip-common-ratings-${guid()}`}><b>{t('common.ratings')}</b></Tooltip>)
    let ratings = this.state.loading ? loading : (
      <div className='participants-item'>
        <OverlayTrigger trigger={['hover', 'focus']} placement='bottom' overlay={tooltipRatings}>
          <i className='icon-ratings'>
            <Icon keyName='common.ratings.up' />/<Icon keyName='common.ratings.down' />
          </i>
        </OverlayTrigger>
        &nbsp;
        {this.state.stats.comments.ratings}
      </div>
    )

    return (
      <Link
        to={topic.url}
        className='topic-card'>
        <div
          className='topic-cover'
          style={{
            backgroundImage: `url("${topicStore.getCoverUrl(topic)}")`
          }} />
        <h3 className='title'>
          {topic.mediaTitle}
        </h3>
        {!config.sharedMongo && (
          <div className='participants'>
            {(showResults || showComments) && participants}
            {showResults && votes}
            {showComments && comments}
            {showComments && ratings}
          </div>
        )}

      </Link>
    )
  }
}
