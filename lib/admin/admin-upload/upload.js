import React, { Component } from 'react'
import t from 't-component'

export default class AdminUpload extends Component {
  constructor () {
    super()
    this.state = { files: [],
      url: '' }
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
  render () {
    return (<div>
      <h1>Images</h1>
      {this.state.files.map((file, id) =>
        <div key={id}><img src={this.state.url + file} />
          <a href={this.state.url + file} > {file} </a>
        </div>
              )}
      <form ref='uploadForm' id='uploadForm' action='/api/v2/upload' method='post' encType='multipart/form-data'>
        <input type='file' name='sampleFile' />
        <input type='submit' value={t('admin.upload.file')} />
      </form>
    </div>)
  }
}
