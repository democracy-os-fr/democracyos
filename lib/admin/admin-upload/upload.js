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
            console.log(this.state)
          }).catch((err) => {
            console.log(err)
          })
  }

  onDrop (image) {
    console.log('onDrop')
    console.dir(image)

    request
    .post('/api/v2/upload')
    .field('file', image)
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
      {/*
        <form ref='uploadForm' id='uploadForm' action='/api/v2/upload' method='post' encType='multipart/form-data'>
          <input type='file' name='sampleFile' />
          <input type='submit' value={t('admin.upload.file')} />
        </form>
      */}
      <div className='well'>
        <ImageUploader
          withIcon
          withPreview
          buttonText='Choose images'
          onChange={this.onDrop}
          imgExtension={['.jpg', '.gif', '.png', '.gif']}
          maxFileSize={5242880} />
      </div>
      {this.state.files.map((file, id) =>
        <div key={id}><img src={this.state.url + file} style={style} />
          <a href={this.state.url + file} > {file} </a>
        </div>
      )}
    </div>)
  }
}
