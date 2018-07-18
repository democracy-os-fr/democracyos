import React, { Component } from 'react'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import t from 't-component'
import guid from 'mout/random/guid'
import { Helmet } from 'react-helmet'
import config from 'lib/config'
import request from 'lib/request/request.js'
import Icon from 'lib/common/icon'
import topicStore from 'lib/stores/topic-store/topic-store'

export default class Social extends Component {
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
      loading: true
    }
  }

  componentWillMount () {
    this.setStateFromProps(this.props)
  }

  componentWillReceiveProps (props) {
    this.setStateFromProps(props)
  }

  setStateFromProps (props) {
    this.setState({ loading: true })
    const { topic } = props
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
    const { forum, topic } = this.props
    const { url, mediaTitle } = topic
    const { showResults } = this.state
    const showComments = !topic.attrs || !topic.attrs.disableComments

    const socialLinksUrl = window.location.origin + url
    const twitterText = encodeURIComponent(
      config.tweetText ? t(config.tweetText, { topic }) : mediaTitle
    )

    let loading = (<i className='fa fa-spinner fa-spin fa-fw' />)

    let isPrivate = forum.visibility === 'private'

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
        {this.state.stats.votes}
      </div>
    )

    let comments = this.state.loading ? loading : (
      <div className='participants-item'>
        <Icon keyName='common.comments' tooltip />
        &nbsp;
        {this.state.stats.replies}
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
        {this.state.stats.ratings}
      </div>
    )

    return (
      <div className='topic-article-content topic-social'>

        {!isPrivate && (
          <Helmet>

            // Twitter meta
            <meta name='twitter:card' content='summary_large_image' />
            <meta name='twitter:site' content={config.socialshare.twitter.username} />
            <meta name='twitter:title' content={this.props.topic.mediaTitle} />
            <meta name='twitter:description' content={this.props.topic.clauses.map((clause) => { return clause.markup }).join('')} />
            <meta name='twitter:image' content={topicStore.getCoverUrl(this.props.topic)} />

            // Facebook meta
            <meta property='og:url' content={socialLinksUrl} />
            <meta property='og:type' content='website' />
            <meta property='og:title' content={this.props.topic.mediaTitle} />
            <meta property='og:description' content={this.props.topic.clauses.map((clause) => { return clause.markup }).join('')} />
            <meta property='og:image' content={topicStore.getCoverUrl(this.props.topic)} />
          </Helmet>
        )}

        <div className='participants-box'>
          {(showResults || showComments) && (<b>{t('proposal-social.title')}&emsp;</b>)}
          {(showResults || showComments) && participants}
          {showResults && votes}
          {showComments && comments}
          {showComments && ratings}
        </div>

        {!isPrivate && (
          <div className='share-links'>
            <a
              href={`http://www.facebook.com/sharer.php?u=${socialLinksUrl}`}
              target='_blank'
              rel='noopener noreferrer'
              className='icon-social-facebook' />
            <a
              href={`http://twitter.com/share?text=${twitterText}&url=${socialLinksUrl}`}
              target='_blank'
              rel='noopener noreferrer'
              className='icon-social-twitter' />
          </div>
        )}

      </div>
    )
  }
}
