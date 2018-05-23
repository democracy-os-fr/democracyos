import React, { Component } from 'react'
import ImageUploader from 'lib/common/uploader'
import request from 'lib/request/request.js'

export default class AdminUpload extends Component {
  constructor () {
    super()
    this.state = {
      files: [],
      images: [],
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
      let lastFileUploaded
      let last
      let files = [...this.state.files]
      let creationDates = [...this.state.filesDates]
      let lastCreationDate = new Date(creationDates[0].birthtime.toString())
      for (let i = 0; i < creationDates.length; i++) {
        if (lastCreationDate <= new Date(creationDates[i].birthtime.toString())) {
          lastCreationDate = new Date(creationDates[i].birthtime.toString())
          last = i
        }
      }
      console.log('lastFIleUploadedBefore: ' + this.state.lastFile)
      lastFileUploaded = files[last]
      this.setState({ lastFile: lastFileUploaded })
      console.log('lastFIleUploadedAfter: ' + this.state.lastFile)
    }).catch((err) => {
      console.log(err)
    })
  }

  componentWillMount () {
    // this.fetchImages()
  }

  onDrop = (image) => {
    console.log('onDrop')
    console.dir(image[0])
    request
    .post('/api/v2/upload')
    .field(image)
    .end((err, res) => {
      if (err || !res.ok) {
        this.handleError([err || res.text])
      }
      this.setState({
        images: this.state.images.concat(image),
        lastFile: image[0].name
      })
      console.log('last File uploaded: ')
      console.log(this.state.lastFile)
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
      <img src={'/uploads/' + this.state.lastFile} style={style} />
      {/* {this.state.files.map((file, id) =>
        <div key={id}><img src={this.state.url + file} style={style} />
          <a href={this.state.url + file} > {file} </a>
        </div>
              )} */}
      {/*
      <form ref='uploadForm' id='uploadForm' action='/api/v2/upload' method='post' encType='multipart/form-data'>
        <input type='file' name='sampleFile' />
        <input type='submit' value={t('admin.upload.file')} />
      </form>
      */}
    </div>)
  }
}
