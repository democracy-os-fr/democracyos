import React, { Component } from 'react'
import ImageUploader from 'lib/common/uploader'
import request from 'lib/request/request.js'

export default class AdminUpload extends Component {
  constructor () {
    super()
    this.state = {
      files: [],
      images: null,
      url: '',
      filesDates: [],
      lastFile: ''
    }
  }

  fetchImages = () => {
    window.fetch('/api/v2/upload.files')
    .then((res) => {
      console.log(res)
      return res.json()
    }).then((res) => {
      console.log(res.files)
      this.setState({ files: res.files,
        url: res.url,
        filesDates: res.filesDates
      })
    }).catch((err) => {
      console.log(err)
    })
  }

  componentWillMount () {
    this.fetchImages()
  }
  onSubmit = (event) => {
    event.preventDefault()
    request
    .post('/api/v2/upload')
    .field(this.state.images)
    .end((err, res) => {
      if (err || !res.ok) {
        this.handleError([err || res.text])
      }
      console.log('last File uploaded: ')
      console.log(this.state.lastFile)
    })
    window.location.reload()
  }
  // onDelete = (event) => {
  //   event.preventDefault()
  //   request
  //   .post('/api/v2/upload.deleteFile')
  //   .end((err, res) => {
  //     if (err || !res.ok) {
  //       throw (err)
  //     }
  //     console.log('delete Success!')
  //   })
  //   window.location.reload()
  // }
  onDrop = (image) => {
    console.log('onDrop')
    console.dir(image[0])
    this.setState({
      images: image,
      lastFile: image[0].name
    })
  }
  delete = (event) => {
    event.preventDefault()
    request
    .post('/api/v2/upload.deleteFiles')
    .end((err, res) => {
      if (err || !res.ok) {
        this.handleError([err || res.text])
      }
      window.location.reload()
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
      <button onClick={this.onSubmit} > upload image </button>
      <button onClick={this.delete}> delete images </button>
      {this.state.files.map((file) =>
        <div key={file} name='imagename'> <img src={this.state.url + file} style={style} />
          <a id='imgtoDelete' href={this.state.url + file} > {file} </a>
          <form action='/api/v2/upload.deleteFile' method='post'>
            <input type='hidden' name='imagetodelete' value={file} />
            <input type='submit' value='delete' />
          </form>
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
