import React, { Component } from 'react'
// import { Button } from 'react-bootstrap'
import t from 't-component'
import mapping from './mapping'

export default class Icon extends Component {
  render () {
    let classes = this.props.classes || []
    classes.push(mapping[this.props.keyName] || this.props.keyName)
    return (
      <i className={classes.join(' ')}>
        { this.props.keyName && (<span className='sr-only'>{t(this.props.keyName)}</span>) }
      </i>
    )
  }
}
