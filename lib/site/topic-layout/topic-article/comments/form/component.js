import React, { Component } from 'react'
import { Link } from 'react-router'
import t from 't-component'
import userConnector from 'lib/site/connectors/user'
import config from 'lib/config/config'
import AutoGrowTextarea from './autogrow-textarea'

class CommentsForm extends Component {
  constructor (props) {
    super(props)

    this.state = CommentsForm.getInitialState()
  }

  static getInitialState () {
    return {
      focused: false,
      loading: false,
      title: '',
      text: '',
      error: null
    }
  }

  componentWillReceiveProps = (nextProps) => {
    const commentsCreating = nextProps.commentsCreating || {}

    if (commentsCreating.pending) {
      this.setState({
        loading: true,
        error: ''
      })
    } else if (commentsCreating.rejected) {
      this.setState({
        loading: false,
        error: t('modals.error.default')
      })
    } else if (commentsCreating.fulfilled) {
      this.setState(CommentsForm.getInitialState())
    }
  }

  handleFocus = () => {
    this.setState({ focused: true })
  }

  handleBlur = () => {
    this.setState({ focused: (!!this.state.title) || (!!this.state.text) })
  }

  handleTitleChange = (evt) => {
    const title = evt.currentTarget.value || ''

    this.setState({
      title: title,
      focused: title ? true : this.state.focused
    })
  }

  handleTextChange = (evt) => {
    const text = evt.currentTarget.value || ''

    this.setState({
      text: text,
      focused: text ? true : this.state.focused
    })
  }

  handleKeyDown = (evt) => {
    if ((evt.ctrlKey || evt.metaKey) && evt.key === 'Enter') {
      this.handleSubmit(evt)
    }
  }

  handleSubmit = (evt) => {
    evt.preventDefault()
    this.setState({ error: '' })

    const title = this.state.title.trim()
    const text = this.state.text.trim()

    if (text === '') return

    this.props.onSubmit({ title, text })
  }

  render () {
    const {
      forum,
      topic,
      user
    } = this.props

    if (user.state.pending) return null

    if (user.state.fulfilled && !forum.privileges.canVoteAndComment) {
      return <NotAllowed />
    }

    if (user.state.rejected) return <NeedsLogin />

    const userAttrs = user.state.value
    const focusedClass = this.state.focused ? 'focused' : ''

    let commentsLength = config.maxCommentsLength
    if (topic.attrs && topic.attrs.commentsLength) {
      commentsLength = topic.attrs.commentsLength
    }
    return (
      <form
        onSubmit={this.handleSubmit}
        id='comments-form'
        className={`topic-comments-form ${focusedClass}`}>
        {this.state.loading && <div className='loader' />}
        <img
          className='avatar'
          src={userAttrs.avatar}
          alt={userAttrs.fullName} />
        {this.state.focused && (
          <h3 className='name'>{userAttrs.displayName}</h3>
        )}
        {this.state.focused && (
          <input
            type='text'
            className='form-control comment-title'
            id='title'
            name='title'
            maxLength='1024'
            value={this.state.title}
            onChange={this.handleTitleChange}
            placeholder={t('comments.title.placeholder')}
            required='required' />
        )}
        <AutoGrowTextarea
          className='comments-create'
          value={this.state.text}
          onChange={this.handleTextChange}
          onFocus={this.handleFocus}
          // onBlur={this.handleBlur}
          onKeyDown={this.handleKeyDown}
          placeholder={t('comments.create.placeholder')}
          maxLength={commentsLength}
          minLength='1'
          rows='1'
          wrap='soft'
          required='required' />
        {this.state.focused && (
          <div className='actions'>
            <button
              className='btn btn-sm btn-outline-success'
              type='submit'>
              {t('comments.create.publish')}
            </button>
            {this.state.error && (
              <div className='alert alert-danger error' role='alert'>
                {t('modals.error.default')}
              </div>
            )}
          </div>
        )}
      </form>
    )
  }
}

function NotAllowed () {
  return (
    <div className='alert alert-warning' role='alert'>
      {t('privileges-alert.not-can-vote-and-comment')}
    </div>
  )
}

function NeedsLogin () {
  const ref = `${location.pathname}${location.search}#comments-form`

  return (
    <div className='alert alert-info' role='alert'>
      <span className='icon-bubble' />{' '}
      {t('comments.sign-in-required')}.{' '}
      <Link to={{ pathname: '/signin', query: { ref } }}>
        {t('signin.login')}
      </Link>
      {' '}{t('common.or')}{' '}
      <Link to={{ pathname: '/signup', query: { ref } }}>
        {t('signin.signup')}
      </Link>
    </div>
  )
}

export default userConnector(CommentsForm)
