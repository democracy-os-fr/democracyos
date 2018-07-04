import React, { Component } from 'react'
import t from 't-component'
import { Link } from 'react-router'
import contains from 'mout/array/contains'
import typecast from 'mout/string/typecast'
import merge from 'mout/object/merge'
import topicStore from 'lib/stores/topic-store/topic-store'
import userConnector from 'lib/site/connectors/user'
import ChangeVote from '../change-vote-button/component'

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
      changingVote: false,
      showLoginMessage: false,
      selected: [],
      ownVote: null,
      voted: false,
      results: null

    }
  }

  handlePoll = (e) => {
    if (!this.state.changingVote) {
      if (!this.props.user.state.fulfilled) return
      if (this.state.showResults) return
    }

    if (this.state.closed || this.state.voted) return
    if (this.state.selected.length === 0) return
    topicStore.vote(this.props.topic.id, this.state.selected)
      .then(() => {
        // this.setStateFromProps({ topic }, { selected: [] })
        this.setState((prevState) => ({
          changingVote: false
        }))
      })
      .catch((err) => { throw err })
  }

  select = (option) => (e) => {
    if (this.props.user.state.rejected) {
      console.log('rejected')
      return this.setState({ showLoginMessage: true })
    }
    if (this.state.changingVote || (!(this.props.topic.closed || this.state.voted))) {
      var selected = this.state.selected
      if (this.props.topic.action.multiple) {
        if (selected.indexOf(option) === -1) selected.push(option)
        else selected.splice(selected.indexOf(option), 1)
      } else {
        selected = [option]
      }
      this.handleCanLeave(this.props.topic.closed, this.state.voted, (selected.length !== 0))
      this.setState({ selected: selected, changingVote: true })
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
    let voted = typecast(topic.voted)
    const selected = props.keepSelection ? this.state.selected : []
    this.handleCanLeave((topic.status === 'closed'), voted, (selected.length !== 0))
    return this.setState(merge({
      showLoginMessage: false,
      results: Poll.getResults(topic, ownVote),
      selected: selected,
      showResults: topic.status === 'closed' || !(topic.attrs && topic.attrs.hideResultsBeforeClosing),
      ownVote,
      voted
    }, _static))
  }

  handleCanLeave = (closed, voted, selected) => {
    this.props.handleCanLeave(closed || voted || (selected.length === 0))
  }

  changeVote = () => {
    this.setState({
      changingVote: true
    })
  }

  render () {
    if (this.props.user.state.pending) return null
    const { user, topic } = this.props
    const { results, changingVote, selected, voted } = this.state
    const votesTotal = this.props.topic.action.count

    if (!results) return null

    const showResults = (topic.closed && voted)
    const showVoteBox = !(topic.closed || voted) || changingVote
    const showChangeVote = (!changingVote) && voted && (!topic.closed)
    const showVoteButton = showVoteBox && !showResults && changingVote

    return (
      <div className='topics-poll'>
        <div className='poll-options'>
          {
            showResults && results.map((result, i) => (
              <ResultBox
                key={i}
                selected={contains(selected, result.value)}
                value={result.value}
                percentage={result.percentage}
                winner={result.winner}
                voted={voted} />
            ))
          }
          {showResults && (
            <h5 className='results-total'>
              {
                  votesTotal === 0
                    ? t('proposal-options.no-votes-cast')
                    : t('proposal-options.votes-cast', { num: votesTotal })
                }
            </h5>
          )}
          {
            (showVoteBox && !showResults) && results.map((result, i) => (
              <Option
                key={i}
                onSelect={this.select(result.value)}
                value={result.value}
                selected={contains(selected, result.value)} />
            ))
          }
          { showChangeVote && <ChangeVote handleClick={this.changeVote} /> }
          {
            showVoteButton && <button
              className='btn btn-primary'
              onClick={this.handlePoll}>
              {t('topics.actions.poll.do')}
            </button>
          }
        </div>
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

const Option = ({ onSelect, selected, value }) => (
  <button
    className={'btn btn-default poll-btn not-show-results'}
    onClick={onSelect}>
    {selected && <span className='circle icon-check' />}
    {!selected && <span className='circle' />}
    <span className='poll-option-label'>{ value }</span>
  </button>
)

const ResultBox = ({ winner, selected, percentage, value, voted }) => {
  return (
    <button className={
      'btn btn-default poll-btn show-results' +
      (winner ? ' winner' : '')
    }>
      {(selected || voted) && <span className='circle icon-check' />}
      <span className='poll-results'>{ percentage }%</span>
      <span className='poll-option-label'>{ value }</span>
      <div className='results-bar' style={{ width: `${percentage}%` }} />
    </button>
  )
}

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
