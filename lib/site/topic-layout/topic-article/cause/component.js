import React, { Component } from 'react'
import t from 't-component'
import typecast from 'mout/string/typecast'
import topicStore from 'lib/stores/topic-store/topic-store'
import userConnector from 'lib/site/connectors/user'
import CantComment from '../cant-comment/component'
import Required from '../required/component'

export class Cause extends Component {
  state = {
    showResults: false,
    results: null
  }

  componentWillMount () {
    this.setStateFromProps(this.props)
  }

  componentWillReceiveProps (props) {
    this.setStateFromProps(props)
  }

  setStateFromProps (props) {
    const { topic } = props
    let voted = topic.voted
    if (typeof voted === 'string') {
      voted = voted.toLowerCase() === 'support'
    }
    return this.setState({
      showLoginMessage: false,
      showResults: topic.closed || !(topic.attrs && topic.attrs.hideResultsBeforeClosing),
      closed: topic.closed,
      supported: typecast(topic.voted)
    })
  }

  handleSupport = (e) => {
    if (this.state.closed) return

    if (!this.props.user.state.fulfilled) {
      return this.setState({ showLoginMessage: true })
    }

    topicStore.vote(this.props.topic.id, 'support')
    .then((topic) => {
      this.setStateFromProps({ topic })
    })
    .catch((err) => { throw err })
  }

  render () {
    const { user, topic } = this.props

    if (user.state.pending) return null

    const { supported } = this.state
    const showResults = topic.closed
    const cantComment = user.state.fulfilled && !topic.privileges.canVote
    const isRequired = !user.state.fulfilled && !showResults
    const showVoteButton = user.state.fulfilled && !supported && !showResults
    const showChangeVote = !showResults && supported

    return (
      <div className='topics-cause'>
        {showChangeVote && (
          <div className='voted-box'>
            <div className='alert alert-info alert-voted' role='alert'>
              <span className='icon-info bold' />
              <span className='black bold thanks'>{t('topics.actions.thanks')}</span>
              <span className='black'>{t('topics.actions.feedback')}</span>
            </div>
            <button
              className='btn btn-secondary'
              onClick={this.handleSupport}>
              <i className='fa fa-heart' />
              &nbsp;
              {t('topics.actions.cause.done')}
            </button>
          </div>
        )}
        {showVoteButton && (
          <button
            className='btn btn-primary'
            disabled={topic.closed}
            onClick={this.handleSupport}>
            <i className='fa fa-heart-o' />
                &nbsp;
            {t('topics.actions.cause.do')}
          </button>
        )}
        {
          isRequired && (
            <Required />
          )
        }
        {
          cantComment && (
            <CantComment />
          )
        }
      </div>
    )
  }
}

export default userConnector(Cause)
