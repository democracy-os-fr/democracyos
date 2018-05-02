import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import t from 't-component'

export default class Results extends Component {
  constructor (props) {
    super(props)

    this.state = {
      status: 'draft'
    }
  }

  componentWillMount () {}

  componentWillUnmount () {}

  render () {
    return (
      <div className=''>
        {this.state.status}
      </div>
    )
  }
}
