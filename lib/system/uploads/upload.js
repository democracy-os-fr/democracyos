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
    const buttonSuccessStyle = {
      backgroundColor: '#5cb85c',
      color: '#fff',
      borderColor: '#4cae4c',
      display: 'inline - block',
      padding: '6px 12px',
      marginBottom: 0,
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: '1.42857143',
      textAlign: 'center',
      cursor: 'pointer',
      width: 300,
      marginLeft: '150px'
    }
    const buttonDeleteStyle = {
      backgroundColor: '#d9534f',
      color: '#fff',
      borderColor: '#d43f3a',
      display: 'inline - block',
      padding: '6px 12px',
      marginBottom: 0,
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: '1.42857143',
      textAlign: 'center',
      cursor: 'pointer',
      width: 300,
      marginLeft: '50px'
    }
    const buttonDeleteOneStyle = {
      backgroundColor: '#d9534f',
      color: '#fff',
      borderColor: '#d43f3a',
      display: 'inline - block',
      padding: '6px 12px',
      marginBottom: 0,
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: '1.42857143',
      textAlign: 'center',
      cursor: 'pointer',
      width: 100
    }
    const imageStyle = {
      marginTop: '20px',
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
      <button style={buttonSuccessStyle} onClick={this.onSubmit} ><i className='fa fa-upload' /> upload image </button>
      <button style={buttonDeleteStyle} onClick={this.delete}> <i className='fa fa-trash-o' /> delete images </button>
      {this.state.files.map((file) =>
        <div key={file} name='imagename'> <img src={this.state.url + file} style={imageStyle} />
          <form action='/api/v2/upload.deleteFile' method='post'>
            <input type='hidden' name='imagetodelete' value={file} />
            <button style={buttonDeleteOneStyle} > <i className='fa fa-trash-o' /> delete </button>
          </form>
        </div>
              )}
    </div>)
  }
}
