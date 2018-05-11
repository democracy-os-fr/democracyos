import React, { Component } from 'react'
import t from 't-component'
import ImageUploader from 'lib/common/uploader'
import request from 'lib/request/request.js'

export default class AdminUpload extends Component {
  constructor () {
    super()
    this.state = {
      files: [],
      images: [],
      url: ''
    }
    this.onDrop = this.onDrop.bind(this)
  }
  componentDidMount () {
    window.fetch('/api/v2/upload.files')
          .then((res) => {
            console.log(res)
            return res.json()
          }).then((res) => {
            console.log(res.files)
            this.setState({ files: res.files,
              url: res.url })
            console.log('state :' + JSON.stringify(this.state))
          }).catch((err) => {
            console.log(err)
          })
  }
  onDrop (image) {
    console.log('onDrop')
    console.dir(image[0])
    request
    .post('/api/v2/upload')
    .field(image)
    .end((err, res) => {
      if (err || !res.ok) {
        this.handleError([err || res.text])
      }
      console.dir(res)
      this.setState({
        images: this.state.images.concat(image)
      })
    })
  }
  render () {
    let style = {
      width: 300,
      height: 250
    }
    return (<div>
      <h1>Images</h1>
      <div name='file' className='well'>
        <ImageUploader
          withIcon
          withPreview
          onChange={this.onDrop}
          imgExtension={['.jpg', '.jpeg', '.png', '.gif']}
          maxFileSize={5242880} />
      </div>
      {this.state.files.map((file, id) =>
        <div key={id}><img src={this.state.url + file} style={style} />
          <a href={this.state.url + file} > {file} </a>
        </div>
              )}
      {/*
      <form ref='uploadForm' id='uploadForm' action='/api/v2/upload' method='post' encType='multipart/form-data'>
        <input type='file' name='sampleFile' />
        <input type='submit' value={t('admin.upload.file')} />
      </form>
      */}
    </div>)
  }
}
