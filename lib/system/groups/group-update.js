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
      logoUrl: '',
      users: [],
      displayUsers: false,
      dispalyFinalUsers: false,
      searchedUsers: [],
      image: { name: '', url: '' },
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
      currentImage.name = utils.imageName(res.body.logoUrl)
      currentImage.url = res.body.logoUrl
      let finalIds = [...this.state.finalUsersIds]
      res.body.users.map((user) => {
        finalIds.push(user.id)
      })
      this.setState({ name: res.body.name,
        image: currentImage,
        logoUrl: res.body.logoUrl,
        finalUsers: res.body.users,
        finalUsersIds: finalIds })
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
      logoUrl: this.state.logoUrl,
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
  onDrop = (images) => {
    if (!isEmpty(images)) {
      this.setState({
        image: images,
        logoUrl: utils.buildUploadUrl(images[0].name)
      })
    } else {
      this.onDelete()
    }
  }
  onDelete = () => {
    this.setState({ logoUrl: '',
      image: null })
  }
  // onUserNameInput = (e) => {
  //   if (e.keyCode === 9) {
  //     e.preventDefault()
  //     let user = this.state.users
  //     return userStore.search(user)
  //     .catch(console.error.bind(console))
  //     .then((users) => {
  //       this.setState({ searchedUsers: users,
  //         displayUsers: true })
  //     })
  //   }
  // }
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
    const { name, logoUrl, users } = this.state
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
    console.log(this.state.image)
    return (
      <article className='group-add-form col-xs-12 col-md-8 col-md-offset-2'>
        <div className='group-top'>
          <h1 className='group-title'>{t('group.form.edit.title')}</h1>
        </div>
        <form
          className='form'
          method='post' >
          <div className='nameInput'>
            <label>{t('group.form.name.label')}</label>
            <input
              type='text'
              name='name'
              id={this.state.formIsValid ? '' : 'nullInput'}
              value={name}
              onChange={this.handleChange('name')} />
            {nameErr}
          </div>
          <div className='logoUrlInput'>
            <label>{t('group.form.logoUrl.label')}</label>
            <input
              type='text'
              name='logoUrl'
              value={logoUrl}
              onChange={this.handleChange('logoUrl')}
              hidden />
            <ImageUploader
              pictures={this.state.image ? [this.state.image] : []}
              withCover
              singleImage
              withUrl
              onChange={this.onDrop}
              onDelete={this.onDelete}
              imgExtension={['.jpg', '.jpeg', '.png', '.gif']}
              maxFileSize={5242880} />
          </div>
          <label>{t('group.form.members.label')}</label>
          <div className='input-group'>
            <div className='input-group-addon'>
              <i className='fa fa-user' />
            </div>
            <input
              type='text'
              name='users'
              placeholder='Ajouter une personne'
              maxLength='256'
              value={users}
                   //  onKeyDown={this.onUserNameInput}
              onChange={this.handleChange('users')} />
          </div>
          {displayedUsers}
          {title}
          {savedUsers}
          <button
            className='btn btn-block btn-primary btn-lg'
            onClick={this.handleSubmit} >

            {t('admin-tags-form.button.submit')}
          </button>
        </form>
      </article>
    )
  }
}
