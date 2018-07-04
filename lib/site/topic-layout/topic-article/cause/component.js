import React, { Component } from 'react'
import t from 't-component'
import { Link } from 'react-router'
import typecast from 'mout/string/typecast'
import topicStore from 'lib/stores/topic-store/topic-store'
import userConnector from 'lib/site/connectors/user'

export class Cause extends Component {
  state = {
    showResults: false,
    showLoginMessage: false,
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

    const { supported, showResults, showLoginMessage } = this.state
    const votesTotal = this.props.topic.action.count

    return (
      <div className='topics-cause'>
        {supported && (
          <button
            className='btn btn-secondary'
            onClick={this.handleSupport}>
            <i className='icon-heart' />
            &nbsp;
            {t('topics.actions.cause.done')}
          </button>
        )}
        {showLoginMessage ? (
          <LoginMessage />
        ) : (!supported && (
          <button
            className='btn btn-primary'
            disabled={topic.closed}
            onClick={this.handleSupport}>
            <i className='icon-heart' />
                &nbsp;
            {t('topics.actions.cause.do')}
          </button>
        ))}
        {user.state.fulfilled && !topic.privileges.canVote && (
          <p className='text-mute overlay-vote'>
            <span className='icon-lock' />
            <span className='text'>
              {t('privileges-alert.not-can-vote-and-comment')}
            </span>
          </p>
        )}
        {showResults && (
          <h5 className='results-total'>
            {
              votesTotal === 0
                ? t('proposal-options.no-votes-cast')
                : votesTotal + ' ' + (votesTotal === 1 ? t('common.vote') : t('common.votes'))
            }
          </h5>
        )}
      </div>
    )
  }
}

export default userConnector(Cause)

const LoginMessage = () => (
  <div className='alert alert-info' role='alert'>
    <span className='icon-heart' />{' '}
    {t('proposal-options.must-be-signed-in')}.{' '}
    <Link
      to={{
        pathname: '/signin',
        query: { ref: window.location.pathname }
      }}>
      {t('signin.login')}
    </Link>
    {' '}{t('common.or')}{' '}
    <Link
      to={{
        pathname: '/signup',
        query: { ref: window.location.pathname }
      }}>
      {t('signin.signup')}
    </Link>
  </div>
)
