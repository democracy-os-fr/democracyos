import React, { Component } from 'react'
import t from 't-component'
import { Link } from 'react-router'
import contains from 'mout/array/contains'
import merge from 'mout/object/merge'
import topicStore from 'lib/stores/topic-store/topic-store'
import userConnector from 'lib/site/connectors/user'

export class Poll extends Component {
  static getResults (topic, userVote) {
    const results = topic.action.results
    const winnerCount = Math.max(...results.map((opt) => opt.percentage))
    let userVotes = []
    try {
      userVotes = JSON.parse(userVote)
    } catch (e) {
      userVotes = userVote
    }
    if (!Array.isArray(userVotes)) {
      userVotes = [userVotes]
    }

    return results.map((opt) => Object.assign({
      winner: winnerCount === opt.percentage,
      voted: contains(userVotes, opt.value)
    }, opt))
  }

  constructor (props) {
    super(props)

    this.state = {
      showResults: false,
      showLoginMessage: false,
      selected: [],
      ownVote: null,
      voted: false,
      results: null
    }
  }

  handlePoll = (e) => {
    if (!this.props.user.state.fulfilled) return
    if (this.props.topic.closed || this.state.voted) return
    if (this.state.selected.length === 0) return

    topicStore.vote(this.props.topic.id, this.state.selected)
      .then((topic) => {
        this.setStateFromProps({ topic }, { selected: [] })
      })
      .catch((err) => { throw err })
  }

  select = (option) => (e) => {
    if (this.props.user.state.rejected) {
      return this.setState({ showLoginMessage: true })
    }
    if (!(this.props.topic.closed || this.state.voted)) {
      var selected = this.state.selected
      if (this.props.topic.action.multiple) {
        if (selected.indexOf(option) === -1) selected.push(option)
        else selected.splice(selected.indexOf(option), 1)
      } else {
        selected = [option]
      }
      this.handleCanLeave(this.props.topic.closed, this.state.voted, (selected.length !== 0))
      this.setState({ selected: selected })
    }
  }

  componentWillMount () {
    this.setStateFromProps(this.props)
  }

  componentWillReceiveProps (props) {
    this.setStateFromProps(props)
  }

  setStateFromProps (props, _static = {}) {
    const { topic } = props
    const ownVote = topic.voted
    let voted = topic.voted
    if (typeof voted === 'string') {
      voted = voted.toLowerCase() !== 'false'
    }
    const selected = props.keepSelection ? this.state.selected : []
    this.handleCanLeave((topic.status === 'closed'), voted, (selected.length !== 0))
    return this.setState(merge({
      showLoginMessage: false,
      showResults: topic.status === 'closed' || !(topic.attrs && topic.attrs.hideResultsBeforeClosing),
      results: Poll.getResults(topic, ownVote),
      selected: selected,
      ownVote,
      voted
    }, _static))
  }

  handleCanLeave = (closed, voted, selected) => {
    this.props.handleCanLeave(closed || voted || (!selected))
  }

  render () {
    if (this.props.user.state.pending) return null
    const { user, topic } = this.props
    const { voted, results, showResults } = this.state
    const votesTotal = this.props.topic.action.count

    if (!results) return null

    return (
      <div className='topics-poll'>
        <div className='poll-options'>
          {results.map((result, i) => (
            <Option
              key={i}
              onSelect={(!voted || !showResults) && this.select(result.value)}
              selected={this.state.selected.indexOf(result.value) > -1}
              showResults={(voted || this.props.topic.closed) && this.state.showResults}
              value={result.value}
              percentage={result.percentage}
              winner={result.winner}
              voted={result.voted} />
          ))}
        </div>
        {showResults && (
          <h5 className='results-total'>
            {
                votesTotal === 0
                  ? t('proposal-options.no-votes-cast')
                  : t('proposal-options.votes-cast', { num: votesTotal })
              }
          </h5>
        )}
        {!(this.props.topic.closed || voted) && (
          <button
            ref={(button) => { this.button = button }}
            className='btn btn-primary'
            disabled={this.state.selected.length === 0}
            onClick={this.handlePoll}>
            {t('topics.actions.poll.do')}
          </button>
        )}
        {!user.state.fulfilled && this.state.showLoginMessage && (
          <LoginMessage />
        )}
        {user.state.fulfilled && !topic.privileges.canVote && (
          <p className='text-mute overlay-vote'>
            <span className='icon-lock' />
            <span className='text'>
              {t('privileges-alert.not-can-vote-and-comment')}
            </span>
          </p>
        )}
      </div>
    )
  }
}

export default userConnector(Poll)

const Option = ({
  value,
  onSelect,
  selected,
  showResults,
  winner,
  voted,
  percentage
}) => (
  <button
    className={
      'btn btn-default poll-btn' +
      (showResults ? ' show-results' : '') +
      (winner ? ' winner' : '') +
      (!showResults ? ' not-show-results' : '')
    }
    onClick={onSelect}>
    {(selected || (voted)) && (
      <span className='circle icon-check' />
    )}
    {!showResults && <span className='circle' />}
    {showResults && <span className='poll-results'>{ percentage }%</span>}
    <span className='poll-option-label'>{ value }</span>
    {showResults && (
      <div className='results-bar' style={{ width: `${percentage}%` }} />
    )}
  </button>
)

const LoginMessage = () => (
  <p className='text-mute overlay-vote'>
    <span className='text'>
      {t('proposal-options.must-be-signed-in') + '. '}
      <Link
        to={{
          pathname: '/signin',
          query: { ref: window.location.pathname }
        }}>
        {t('signin.login')}
      </Link>
      <span>&nbsp;{t('common.or')}&nbsp;</span>
      <Link to='/signup'>
        {t('signin.signup')}
      </Link>.
    </span>
  </p>
)
