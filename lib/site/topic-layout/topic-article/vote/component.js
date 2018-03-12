import React, { Component } from 'react'
import { Link } from 'react-router'
import { Pie } from 'react-chartjs'
import t from 't-component'
import topicStore from 'lib/stores/topic-store/topic-store'
import userConnector from 'lib/site/connectors/user'
import voteOptions from './vote-options'

class Vote extends Component {
  constructor (props) {
    super(props)
    this.options = voteOptions

    this.state = {
      votes: {
        positives: [],
        neutrals: [],
        negatives: []
      },
      alert: {
        className: '',
        text: '',
        hide: true
      },
      voted: false,
      showResults: false,
      changingVote: false
    }
  }

  componentWillMount () {
    let newState = this.prepareState(this.props.topic)
    this.setState(newState)
  }

  componentWillReceiveProps (props) {
    let newState = this.prepareState(props.topic)
    this.setState(newState)
  }

  prepareState (topic) {
    let votes = {
      positive: [],
      negative: [],
      neutral: []
    }
    for (var key in votes) {
      if (topic.action.results.find((o) => o.value === key)) {
        votes[key] = topic.action.results.find((o) => o.value === key).count
      }
    }

    let voted = false
    let votedValue = null
    let alertVote = null

    if (this.props.user.state.fulfilled) {
      for (var votesOpt in votes) {
        if (votes.hasOwnProperty(votesOpt)) {
          if (!votes[votesOpt] === 0) return

          const ownVote = topic.voted === votesOpt
          if (ownVote) {
            voted = true
            votedValue = votesOpt
            alertVote = this.options[votedValue].alert
          }
        }
      }
    }

    let alert
    if (alertVote) {
      alert = {
        className: alertVote.className,
        text: alertVote.text,
        hide: false
      }
    } else {
      alert = {
        className: '',
        text: '',
        hide: true
      }
    }

    return {
      topic,
      voted: voted,
      showResults: topic.closed || !(topic.attrs && topic.attrs.hideResultsBeforeClosing),
      votes: votes,
      alert: alert
    }
  }

  handleVote = (e) => {
    if (!this.props.user.state.fulfilled) return

    let voteValue = e.currentTarget.getAttribute('data-vote')
    topicStore
      .vote(this.props.topic.id, voteValue)
      .then(() => {
        this.setState({
          voted: true,
          changingVote: false,
          alert: Object.assign({}, this.options[voteValue].alert, { hide: false })
        })
      })
      .catch((err) => {
        console.warn('Error on vote setState', err)
        this.setState({
          alert: {
            className: 'alert-warning',
            text: 'proposal-options.error.voting',
            hide: false
          },
          voted: false
        })
      })
  }

  render () {
    const { voted, showResults, votes } = this.state
    const votesTotal = this.state.topic.action.count

    const closed = this.props.topic.closed

    return (
      <div className='proposal-options topic-article-content'>
        {
          !this.state.alert.hide &&
          !this.state.changingVote &&
          (
            <blockquote
              className={`ownVote ${this.state.alert.className}`}>
              {this.state.alert.text && t(this.state.alert.text)}.
            </blockquote>
          )
        }
        {
          votesTotal > 0 && showResults && (
            <ResultBox
              results={this.props.topic.action.results}
              count={this.props.topic.action.count}
              votes={votes}
              votesTotal={votesTotal}
              options={this.options} />
          )
        }
        {
          !closed && (!voted || this.state.changingVote) && (
            <VoteBox options={this.options} onVote={this.handleVote} />
          )
        }
        {
          !this.props.user.state.fulfilled && (
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
        }
        {
          this.props.user.state.fulfilled &&
          !this.props.canVoteAndComment && (
            <p className='text-mute overlay-vote'>
              <span className='icon-lock' />
              <span className='text'>
                {t('privileges-alert.not-can-vote-and-comment')}
              </span>
            </p>
          )
        }
      </div>
    )
  }
}

export default userConnector(Vote)

function ResultBox (props) {
  const votesTotal = props.votesTotal
  const votes = props.votes
  const options = props.options

  let chartData = []
  let chartOptions = {
    animation: false
  }

  if (votesTotal) {
    chartData.push({
      value: votes.positive,
      color: '#a4cb53',
      label: t('proposal-options.yea')
    })
    chartData.push({
      value: votes.neutral,
      color: '#666666',
      label: t('proposal-options.abstain')
    })
    chartData.push({
      value: votes.negative,
      color: '#d95e59',
      label: t('proposal-options.nay')
    })
  }

  return (
    <div className='results-box topic-article-content row'>
      <div className='results-chart col-sm-6'>
        <Pie data={chartData} options={chartOptions} width='220' height='220' />
      </div>
      <div className='results-summary col-sm-6'>
        {
          Object.keys(votes)
            .map(function (v) {
              const option = options[v].button
              let result = props.results.find((r) => r.value === v)

              let width = result ? result.percentage : 0

              return (
                <div className={option.className + ' votes-results'} key={v}>
                  <h5>{t(option.text)}</h5>
                  <span className='percent'>{width}%</span>
                </div>
              )
            })
          }
      </div>
      <h5 className='results-total col-sm-12'>
        {
            votesTotal === 0
              ? t('proposal-options.no-votes-cast')
              : t('proposal-options.votes-cast', { num: votesTotal })
          }
      </h5>
    </div>
  )
}

function VoteBox (props) {
  const options = props.options
  const handleVote = props.onVote

  return (
    <div className='vote-box'>
      <div className='vote-options'>
        <h5>{t('proposal-options.vote')}</h5>
        <div className='direct-vote'>
          {
            Object.keys(options).map(function (o) {
              const option = options[o]
              return (
                <a
                  href='#'
                  className={'vote-option ' + option.button.className}
                  data-vote={o}
                  onClick={handleVote}
                  key={o}>
                  <i className={option.button.icon} />
                  <span>{t(option.button.text)}</span>
                </a>
              )
            })
          }
        </div>
      </div>
    </div>
  )
}
