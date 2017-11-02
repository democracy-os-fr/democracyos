import React, { Component } from 'react'
import t from 't-component'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import guid from 'mout/random/guid'
import mapping from './mapping'

export default class Icon extends Component {
  getIcon () {
    let classes = this.props.classes || []
    classes.push(mapping[this.props.keyName] || this.props.keyName)
    return (
      <i className={classes.join(' ')}>
        { this.props.keyName && (<span className='sr-only'>{t(this.props.keyName)}</span>) }
      </i>
    )
  }

  getTooltip (props) {
    let slug = this.props.keyName.replace('.', '-') + '-' + guid()
    let tooltipIcon = (
      <Tooltip id={`tooltip-${slug}`}><b>{t(this.props.keyName)}</b></Tooltip>
    )
    return (
      <OverlayTrigger trigger={['hover', 'focus']} placement='bottom' overlay={tooltipIcon}>
        {this.getIcon()}
      </OverlayTrigger>
    )
  }

  render () {
    if (this.props.tooltip) {
      return this.getTooltip()
    } else {
      return this.getIcon()
    }
  }
}
