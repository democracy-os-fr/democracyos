import React, { Component } from 'react'
import { Alert, Form, FormGroup, FormControl, Col, InputGroup, HelpBlock, Button } from 'react-bootstrap'
import PropTypes from 'prop-types'
import t from 't-component'
import isEmpty from 'mout/lang/isEmpty'
import guid from 'mout/random/guid'
import request from 'lib/request/request.js'
import Icon from 'lib/common/icon'
import config from 'lib/config'
import utils from './utils'

const propTypes = {
  controlId: PropTypes.string,
  handleChange: PropTypes.func.isRequired,
  types: PropTypes.array,
  maxSize: PropTypes.number,
  value: PropTypes.string
}

const defaultProps = {
  controlId: guid(),
  types: config.upload.images,
  maxSize: config.upload.maxSize,
  value: ''
}

class UploadFormControl extends Component {
  constructor (props) {
    super(props)
    this.state = {
      controlId: isEmpty(props.controlId) ? guid() : props.controlId,
      value: props.value
    }
  }

  componentWillReceiveProps (props) {
    this.state = {
      controlId: isEmpty(props.controlId) ? guid() : props.controlId,
      value: props.value
    }
  }

  handleInputChange = (e) => {
    let url = e.target.value
    if (url !== this.state.value) {
      if (!utils.isWebUri(encodeURI(url))) {
        e.persist()
        e.errors = [t('validators.invalid.url')]
      }
      this.props.handleChange(e)
    }
  }

  handleDropFiles = (e) => {
    if (isEmpty(e.target.files)) {
      console.warn('No files were selected')
    } else {
      // Single file
      const file = e.target.files[0]
      e.persist()
      e.errors = []
      e.value = utils.buildUploadUrl(file.name)

      if (!utils.checkFileType(file.name, this.props.types)) {
        console.dir(file)
        e.errors.push(t('common.upload.error.type', { type: file.type }))
      }
      if (file.size > this.props.maxSize) {
        e.errors.push(t('common.upload.error.size', { size: file.size }))
      }

      utils.readFile(file)

      this.props.handleChange(e)
    }
  }

  triggerDropFiles = (e) => {
    this.inputFiles.click(e)
  }

  handleUpload = () => {
    return request.post('/api/v2/upload').field(this.inputFiles.files)
  }

  render () {
    const { handleChange } = this.props
    const { controlId, value } = this.state

    return (
      <div className='upload-form-control'>
        <input type='hidden' id={`${controlId}-value`} className='form-control' onChange={handleChange} value={value} ref={(ref) => { this.inputHidden = ref }} />
        <input type='file' id={`${controlId}-files`} className='upload-input-files' onChange={this.handleDropFiles} ref={(ref) => { this.inputFiles = ref }} />
        <InputGroup>
          <InputGroup.Button>
            <Button id={`${controlId}-button`} onClick={this.triggerDropFiles}><Icon fixedWidth keyName='common.upload' /></Button>
          </InputGroup.Button>
          <input type='text' id={`${controlId}-text`} className='form-control' value={value} placeholder={utils.buildUploadUrl('...')} onFocus={() => { this.setState({ value: undefined }) }} onBlur={this.handleInputChange} />
        </InputGroup>
      </div>
    )
  }
}

UploadFormControl.propTypes = propTypes
UploadFormControl.defaultProps = defaultProps

export default UploadFormControl
