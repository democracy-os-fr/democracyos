import React, { Component } from 'react'
import ImageUploader from 'lib/common/uploader'
import request from 'lib/request/request.js'
import { Modal, Button, Tabs, Tab, ListGroup, ListGroupItem } from 'react-bootstrap'
import t from 't-component'

export default class AdminUpload extends Component {
  constructor () {
    super()
    this.state = {
      _images: [],
      files: [],
      images: null,
      url: '',
      filesDates: [],
      lastFile: '',
      showModalOnImagesDelete: false,
      showModalOnFilesDelete: false,
      keepSelection: true
    }
  }

  fetchImages = () => {
    window.fetch('/api/v2/upload.files')
    .then((res) => {
      console.log(res)
      return res.json()
    }).then((res) => {
      console.log(res.images)
      this.setState({ _images: res.images,
        files: res.documents,
        url: res.route,
        filesDates: res.stats
      })
    }).catch((err) => {
      console.log(JSON.stringify(err))
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
  onDrop = (image) => {
    console.log('onDrop')
    console.dir(image[0])
    this.setState({
      images: image,
      lastFile: image[0].name
    })
  }
  handleImagesDelete = (event) => {
    event.preventDefault()
    this.setState({ showModalOnImagesDelete: true, keepSelection: true })
  }
  handleFilesDelete = (event) => {
    event.preventDefault()
    this.setState({ showModalOnFilesDelete: true, keepSelection: true })
  }
  deleteImages = (event) => {
    event.preventDefault()
    request
    .post('/api/v2/upload.deleteImages')
    .end((err, res) => {
      if (err || !res.ok) {
        this.handleError([err || res.text])
      }
      window.location.reload()
    })
  }
  deleteFiles = (event) => {
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
  handleModalImagesdeleteClose = () => {
    this.setState({ showModalOnImagesDelete: false, keepSelection: true })
  }
  HandleModalFilesDeleteClose = () => {
    this.setState({ showModalOnFilesDelete: false, keepSelection: true })
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
      width: 150
    }
    const imageStyle = {
      marginTop: '20px',
      width: 300,
      height: 250
    }
    const imagesStyle = {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-between'
    }
    const fileStyle = {
      margin: '25px'

    }
    return (<div>
      <Tabs defaultActiveKey={1} bsStyle='pills' justified id='featured-tabs'>
        <Tab eventKey={1} title={t('onglet.images')}>
          <h1>Images</h1>
          <div name='images' className='well'>
            <ImageUploader
              withIcon
              withPreview
              onChange={this.onDrop}
              imgExtension={['.jpg', '.jpeg', '.png', '.gif']}
              maxFileSize={5242880} />
          </div>
          <button style={buttonSuccessStyle} onClick={this.onSubmit} ><i className='fa fa-upload' /> &emsp; {t('common.upload.images.many')} </button>
          <button style={buttonDeleteStyle} disabled={this.state._images.length <= 0} onClick={this.handleImagesDelete}> <i className='fa fa-trash-o' /> &emsp; {t('common.upload.images.delete.many')} </button>
          <Modal bsSize='small' className='topic-modal' backdrop
            show={this.state.showModalOnImagesDelete}
            onHide={this.handleModalImagesdeleteClose} >
            <Modal.Body className='lead' dangerouslySetInnerHTML={{ __html: t('delete.images.onServer') }} />
            <Modal.Footer>
              <Button bsSize='small' onClick={this.handleModalImagesdeleteClose}>{t('common.cancel')}</Button>
              <Button bsSize='small' bsStyle='primary' onClick={this.deleteImages}>{t('common.ok')}</Button>
            </Modal.Footer>
          </Modal>
          <div name='images' style={imagesStyle}>
            {this.state._images.map((image) =>
              <div key={image} name='imagename'> <img src={this.state.url + image} style={imageStyle} />
                <form action='/api/v2/upload.deleteFile' method='post'>
                  <input type='hidden' name='filetodelete' value={image} />
                  <button style={buttonDeleteOneStyle} > <i className='fa fa-trash-o' /> {t('common.upload.delete.one')} </button>
                </form>
              </div>
              )}
          </div>
        </Tab>
        <Tab eventKey={2} title={t('onglet.files')} >
          <h1>Fichiers</h1>
          <div name='files' className='well'>
            <ImageUploader
              withIcon
              withPreview
              onChange={this.onDrop}
              imgExtension={['.pdf', '.txt', '.odt', '.doc', 'ppt']}
              maxFileSize={5242880} />
          </div>
          <button style={buttonSuccessStyle} onClick={this.onSubmit} ><i className='fa fa-upload' /> &emsp; {t('common.upload.many')} </button>
          <button style={buttonDeleteStyle} disabled={this.state.files.length <= 0} onClick={this.handleFilesDelete}> <i className='fa fa-trash-o' /> &emsp; {t('common.upload.delete.many')}</button>
          <Modal bsSize='small' className='topic-modal' backdrop
            show={this.state.showModalOnFilesDelete}
            onHide={this.HandleModalFilesDeleteClose} >
            <Modal.Body className='lead' dangerouslySetInnerHTML={{ __html: t('delete.files.onServer') }} />
            <Modal.Footer>
              <Button bsSize='small' onClick={this.HandleModalFilesDeleteClose}>{t('common.cancel')}</Button>
              <Button bsSize='small' bsStyle='primary' onClick={this.deleteFiles}>{t('common.ok')}</Button>
            </Modal.Footer>
          </Modal>
          <ListGroup >
            {this.state.files.map((file) =>
              <ListGroupItem bsStyle='success' style={fileStyle}>
                <div key={file} name='fileName'>
                  <a href={this.state.url + file}> {file}</a>
                  <form action='/api/v2/upload.deleteFile' method='post'>
                    <input type='hidden' name='filetodelete' value={file} />
                    <button style={buttonDeleteOneStyle} > <i className='fa fa-trash-o' /> &emsp; {t('common.upload.delete.one')} </button>
                  </form>
                </div>
              </ListGroupItem>
              )}
          </ListGroup>
        </Tab>
      </Tabs>

    </div>)
  }
}
