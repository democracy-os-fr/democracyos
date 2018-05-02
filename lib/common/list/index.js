import React, { Component } from 'react'
import NavBar from './navbar'
import Results from './results'
import defaults from './defaults'

export default class List extends Component {
  constructor (props) {
    super(props)

    this.state = {
      list: [],
      isSearching: false
    }
  }

  handleChildrenInput = (type, body) => {
    console.log('List handleChildrenInput %s %o', type, body)
  }

  isSearching = (text) => {
    clearInterval(this.timer)
    if (text.length > 2) {
      this.timer = setTimeout(console.log('searching %s', text), 500)
    }
    if (text.length === 0) {
      this.setState({ isSearching: false })
    }
  }

  render () {
    return (
      <div className='list'>
        <NavBar isLoading handleInput={this.handleChildrenInput} filters={defaults.filters} sorts={defaults.sorts} />
        <br />
        <Results list={this.props.list} />
      </div>
    )
  }
}
