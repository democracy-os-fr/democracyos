import React, { Component } from 'react'

export default class SearchBarGroups extends Component {
  handleKeyUp = (e) => {
    this.props.isSearching(e.target.value)
  }

  render () {
    const classes = ['form-control', 'search']
    if (this.props.isLoading) classes.push('loading-spinner')

    return (
      <div className='input-group input-group-md search-bar'>
        <span className='input-group-addon'>
          <i className='icon-magnifier' aria-hidden='true' />
        </span>
        <input
          className={classes.join(' ')}
          type='text'
          maxLength='100'
          onKeyUp={this.handleKeyUp}
          placeholder={this.props.placeholder} />
      </div>
    )
  }
}
