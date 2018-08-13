import React, { Component } from 'react'
import t from 't-component'
import isEmpty from 'mout/lang/isEmpty'
import ImageUploader from 'lib/common/uploader'
import request from 'lib/request/request.js'
import utils from 'lib/common/uploader/utils'
import userStore from '../../stores/user-store/user-store'

export default class GroupUpdate extends Component {
  constructor () {
    super()
    this.state = {
      name: '',
      description: '',
      logoUrl: '',
      justificatoryUrl: '',
      users: [],
      displayUsers: false,
      dispalyFinalUsers: false,
      searchedUsers: [],
      image: { name: '', url: '' },
      file: { name: '', url: '' },
      finalUsers: [],
      finalUsersIds: [],
      id: '',
      updated: false,
      errors: {},
      formIsValid: true

    }
  }
  componentDidMount () {
    const pathName = window.location.pathname
    let id = pathName.substring(22, pathName.length)
    this.setState({ id: id })
    request
    .get('/api/group/:id'.replace(':id', id))
    .end((err, res) => {
      if (err || !res.ok) {
        this.handleError([err || res.text])
      }
      let currentImage = { name: '', url: '' }
      if (res.body.logoUrl) {
        currentImage.name = utils.imageName(res.body.logoUrl)
        currentImage.url = res.body.logoUrl
      }
      let currentFile = { name: '', url: '' }
      if (res.body.justificatoryUrl) {
        currentFile.name = utils.imageName(res.body.justificatoryUrl)
        currentFile.url = res.body.justificatoryUrl
      }
      let finalIds = [...this.state.finalUsersIds]
      res.body.users.map((user) => {
        finalIds.push(user.id)
      })
      this.setState({ name: res.body.name,
        description: res.body.description,
        justificatoryUrl: res.body.justificatoryUrl,
        logoUrl: res.body.logoUrl,
        finalUsers: res.body.users,
        finalUsersIds: finalIds,
        image: currentImage,
        file: currentFile })
    })
  }
  handleChange = (name) => (event) => {
    this.setState({
      [name]: event.target.value
    })
    if (name === 'name') {
      this.setState({ formIsValid: true })
    }
    if (name === 'users') {
      let user = this.state.users
      return userStore.search(user)
      .catch(console.error.bind(console))
      .then((users) => {
        this.setState({ searchedUsers: users,
          displayUsers: true })
      })
    }
  }
  handleSubmit = (e) => {
    e.preventDefault()
    let errors = {}
    let formIsValid = [...this.state.formIsValid]
    if (!this.state.name) {
      formIsValid = false
      errors['name'] = 'Requis'
      this.setState({ errors: errors,
        formIsValid: formIsValid })
    }
    let formFields = {
      name: this.state.name,
      description: this.state.description,
      logoUrl: this.state.logoUrl,
      justificatoryUrl: this.state.justificatoryUrl,
      users: this.state.finalUsersIds
    }
    if (this.state.image && formIsValid) {
      request
        .post('/api/v2/upload')
        .field(this.state.image)
        .end((err, res) => {
          if (err || !res.ok) {
            this.handleError([err || res.text])
          }
        })
    }
    if (formIsValid) {
      request
      .post('/api/group/update/:id'.replace(':id', this.state.id), formFields)
      .end((err, res) => {
        if (err || !res.ok) {
          console.log(err)
        } else {
          this.setState({ updated: true })
        }
      })
      window.location.reload()
    }
  }
  onDropImage = (images) => {
    if (!isEmpty(images)) {
      this.setState({
        image: images,
        logoUrl: utils.buildUploadUrl(images[0].name)
      })
    } else {
      this.onDeleteImage()
    }
  }
  onDeleteImage = () => {
    this.setState({ logoUrl: '',
      image: null })
  }
  onDropFile = (files) => {
    if (!isEmpty(files)) {
      this.setState({
        file: files,
        justificatoryUrl: utils.buildUploadUrl(files[0].name)
      })
    } else {
      this.onDeleteFile()
    }
  }
  onDeleteFile = () => {
    this.setState({ justificatoryUrl: '',
      file: null })
  }
  addUser = (user) => {
    let finalUsers = [...this.state.finalUsers]
    let usersIds = [...this.state.finalUsersIds]
    usersIds.push(user.id)
    finalUsers.push(user)
    this.setState({ finalUsersIds: usersIds,
      finalUsers: finalUsers,
      displayUsers: false,
      dispalyFinalUsers: true,
      users: []
    })
  }
  revoke = (user) => {
    let finalUsersIds = [...this.state.finalUsersIds]
    let finalUsers = [...this.state.finalUsers]
    let index = finalUsers.findIndex(function (element) {
      return element === user
    })
    finalUsers.splice(index, 1)
    finalUsersIds.splice(index, 1)
    this.setState({ finalUsers: finalUsers,
      finalUsersIds: finalUsersIds })
  }
  render () {
    const { name, logoUrl, users, justificatoryUrl, image, file, description } = this.state
    let displayedUsers
    let savedUsers
    let title
    let nameErr
    if (this.state.displayUsers) {
      displayedUsers = this.state.searchedUsers.map((user) =>
        <div key={user.id} className='displayedUsers' onClick={() => this.addUser(user)}>
          <img src={user.avatar} />
          <p> {user.displayName} </p>
        </div>
    )
    }
    title = <p>{t('group.list.users.title')} </p>
    savedUsers = this.state.finalUsers.map((user) =>
      <div key={user.id} className='displayedUsers'>
        <img src={user.avatar} />
        <p> {user.displayName} </p>
        <button
          className='deleteButton'
          onClick={() => this.revoke(user)} >
          <i className='fa fa-lg fa-trash text-danger' />
        </button>
      </div>
  )
    if (!this.state.formIsValid) {
      nameErr = <span style={{ color: 'red', float: 'right' }}>{this.state.errors['name']}</span>
    }
    return (
      <div>
        <div className='group-top'>
          <h3 className='group-title'>{t('group.form.edit.title')}</h3>
        </div>
        <form
          className='form-horizontal'
          method='post' >
          <div className='form-group'>
            <label className='col-sm-2 control-label' >{t('group.form.name.label')}</label>
            <div className='col-sm-10'>
              <input
                className='form-control'
                type='text'
                name='name'
                id={this.state.formIsValid ? '' : 'nullInput'}
                value={name}
                onChange={this.handleChange('name')} />
              {nameErr}
            </div>
          </div>
          <div className='form-group'>
            <label className='col-sm-2 control-label'>{t('group.form.description.label')}</label>
            <div className='col-sm-10'>
              <textarea
                className='form-control'
                id='description'
                name='description'
                value={description}
                onChange={this.handleChange('description')} />
            </div>
          </div>
          <div className='form-group'>
            <label className='col-sm-2 control-label'>{t('group.form.logoUrl.label')}</label>
            <div className='col-sm-10'>
              <input
                className='form-control'
                name='logoUrl'
                value={logoUrl}
                onChange={this.handleChange('logoUrl')}
                type='hidden' />
              <ImageUploader
                pictures={image ? [image] : []}
                withCover
                singleImage
                withUrl
                onChange={this.onDropImage}
                onDelete={this.onDeleteImage}
                imgExtension={['.jpg', '.jpeg', '.png', '.gif']}
                maxFileSize={5242880} />
            </div>
          </div>
          <div className='form-group'>
            <label className='col-sm-2 control-label'>{t('forum.form.justificatory')}</label>
            <div className='col-sm-10'>
              <input
                className='form-control'
                type='hidden'
                name='justificatoryUrl'
                value={justificatoryUrl}
                onChange={this.handleChange('justificatoryUrl')} />
              <ImageUploader
                pictures={file ? [file] : []}
                withCover
                singleImage
                withUrl
                onChange={this.onDropFile}
                onDelete={this.onDeleteFile}
                imgExtension={['.pdf']}
                maxFileSize={5242880} />
            </div>
          </div>
          <label className='col-sm-2 control-label'>{t('group.form.members.label')}</label>
          <div className='input-group'>
            <div className='input-group-addon'>
              <i className='fa fa-user' />
            </div>
            <input
              type='text'
              className='form-control'
              name='users'
              placeholder='Ajouter une personne'
              maxLength='256'
              value={users}
              onChange={this.handleChange('users')} />
          </div>
          <div className='usersdisplays'>
            {displayedUsers}
            {title}
            {savedUsers}
          </div>
          <div className='form-group actions'>
            <div className='col-sm-offset-2 col-sm-10'>
              <button
                className='btn btn-success'
                onClick={this.handleSubmit} >
                <i className='glyphicon glyphicon-save' />
                &emsp;
                {t('admin-tags-form.button.submit')}
              </button>
            </div>
          </div>
        </form>
      </div>
    )
  }
}
