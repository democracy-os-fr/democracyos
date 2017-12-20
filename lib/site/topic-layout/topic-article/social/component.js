import React, { Component } from 'react'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import t from 't-component'
import guid from 'mout/random/guid'
import isEmpty from 'mout/lang/isEmpty'
import config from 'lib/config'
import request from 'lib/request/request.js'
import Icon from 'lib/common/icon'

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
    const { topic, user } = props
    request
    .get('/api/stats/topic/' + topic.id)
    .end((err, res) => {
      if (err || !res.ok) {
        this.handleError([err || res.text])
      }
      this.setState({
        showResults: user && user.state && user.state.value && user.state.value.staff,
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
    // const { url, mediaTitle } = topic
    const { showResults } = this.state
    const hasClosedMessage = topic.attrs && !isEmpty(topic.attrs.messageClosed)
    const hasVotedMessage = topic.attrs && !isEmpty(topic.attrs.messageVoted)
    const showComments = !topic.attrs || !topic.attrs.disableComments

    // const socialLinksUrl = window.location.origin + url
    // const twitterText = encodeURIComponent(
    //   config.tweetText ? t(config.tweetText, { topic }) : mediaTitle
    // )

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
      <div className='topic-article-content'>
        {topic.voted && hasVotedMessage && (
          <div className='alert alert-success message-closed'>
            {topic.attrs.messageVoted}
          </div>
        )}
        {topic.closed && hasClosedMessage && (
          <div className='alert alert-info message-closed'>
            {topic.attrs.messageClosed}
          </div>
        )}
        <div className='topic-social'>
          <div className='participants-box'>
            {/* {(showResults || showComments) && (<b>{t('proposal-social.title')}&emsp;</b>)} */}
            {showResults && participants}
            {showResults && votes}
            {showComments && comments}
            {showComments && ratings}
          </div>
          {/* <div className='share-links'>
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
          </div> */}
        </div>
      </div>
    )
  }
}
