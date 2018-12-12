import React, { Component } from 'react'
import { FormGroup, FormControl, Col, ControlLabel, HelpBlock } from 'react-bootstrap'
import t from 't-component'
import isEmpty from 'mout/lang/isEmpty'
import guid from 'mout/random/guid'

class HorizontalFormGroup extends Component {
  render () {
    let { name, label, errors } = this.props
    name = isEmpty(name) ? guid() : name
    label = isEmpty(label) ? '' : t(label)
    errors = isEmpty(errors) ? [] : errors

    let validationState = !isEmpty(errors) ? 'error' : null

    return (
      <FormGroup controlId={name} validationState={validationState}>
        <Col componentClass={ControlLabel} sm={2}>
          {label}
        </Col>
        <Col sm={10}>
          {this.props.children}
          <FormControl.Feedback />
          {!isEmpty(errors) && errors.map((error) =>
            <HelpBlock key={guid()}>{error}</HelpBlock>
          )}
        </Col>
      </FormGroup>
    )
  }
}

export {
  HorizontalFormGroup
}
