import React, { Component } from 'react'
import 'whatwg-fetch'
import t from 't-component'
import urlBuilder from 'lib/url-builder'

export default class UsersImport extends Component {
  constructor (props) {
    super(props)
    this.state = {
      hasError: false,
      success: false,
      count: 0
    }
  }

  onLoadFile = (e) => {
    const input = e.target
    const file = input.files[0]
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target.result
      fetch(`/api/v2/users.csv`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ csv: content })
      })
      .then((res) => {
        input.value = ''
        if (res.status !== 200) {
          this.setState({
            hasError: true
          })
        } else {
          this.setState({
            success: true
          })
          window.location.reload()
        }
        setTimeout(() => this.setState({
          success: false,
          hasError: false
        }), 5000)
      })
      .catch(() => {
        input.value = ''
        this.setState({
          hasError: true
        })
      })
    }
    reader.readAsText(file)
  }

  render () {
    return (
      <div className='users-import'>
        {this.state.hasError && (
          <div className='error-message'>
            <p>
              <i className='fa fa-fw fa-exclamation-circle' />&emsp;
              { t('modals.error.default') }
            </p>
          </div>
        )}
        {this.state.success && (
          <div className='success-message'>
            <p>
              <i className='fa fa-fw fa-check-circle' />&emsp;
              { t('system.users.update-from-csv.success') }
            </p>
          </div>
        )}
        <label className='btn btn-primary label-file'>
          <i className='fa fa-fw fa-upload' />&emsp;
          { t('system.users.update-from-csv') }
          <input type='file' id='users-input-file' accept='.csv' onChange={this.onLoadFile} ref='inputCsv' />
        </label>
      </div>
    )
  }
}
