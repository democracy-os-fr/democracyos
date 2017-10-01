import React, { Component } from 'react'
import t from 't-component'

export default class BtnGoogle extends Component {
  static defaultProps = {
    action: '/auth/google'
  }

  render () {
    const { action } = this.props

    return (
      <form
        className='btn-google-form'
        action={action}
        method='get'
        role='form'>
        <button
          className='btn btn-labeled btn-block btn-google'
          type='submit'>
          <span className='btn-label'>
            <i className='icon-social-google' />
          </span>
          {t('signin.login-with-google')}
        </button>
      </form>
    )
  }
}
