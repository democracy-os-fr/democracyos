import React from 'react'
import { render as ReactRender } from 'react-dom'
import t from 't-component'
import isEmpty from 'mout/lang/isEmpty'
import debug from 'debug'
import utils from 'lib/common/uploader/utils'
import ImageUploader from 'lib/common/uploader'
import request from 'lib/request/request.js'

import FormView from '../../form-view/form-view'
import forumStore from '../../stores/forum-store/forum-store'
import template from './template.jade'
const log = debug('democracyos:admin-topics-form')

export default class GeneralForm extends FormView {
  constructor (forum) {
    if (forum.topicsAttrs) {
      var map = {}
      for (var attr of forum.topicsAttrs) {
        map[attr.name] = true
      }
      forum.topicsAttrs = map
    }
    var options = {
      form: {
        action: '/api/forum/' + forum.id,
        title: t('admin-general.form.title')
      },
      forum: forum
    }
    super(template, options)
    this.options = options
    this.pubButton = this.find('a.make-public')
    this.privButton = this.find('a.make-private')
    request
    .get('/api/group/:id'.replace(':id', forum.associationId))
    .end((err, res) => {
      if (err || !res.ok) {
        this.handleError([err || res.text])
      }
      this.find('#associationName').value(res.body.name)
    })
    this.image = forum.coverUrl ? {
      name: utils.imageName(forum.coverUrl),
      url: forum.coverUrl
    } : null
    this.file = (forum && forum.justificatoryUrl) ? {
      name: utils.imageName(forum.justificatoryUrl),
      url: forum.justificatoryUrl
    } : null
  }
  onBlur = (e) => {
    request
    .get('/api/group/getByName/:name'.replace(':name', e.delegateTarget.value))
    .end((err, res) => {
      if (err || !res.ok) {
        this.handleError([err || res.text])
      }
      if (res.body != null) {
        this.find('#associationId').value(res.body.id)
      } else {
        this.find('#associationId').value(null)
        ReactRender((
          <div className='form-group'>
            <label className='col-sm-2 control-label'>{t('forum.form.justificatory')} </label>
            <div className='col-sm-10'>
              <ImageUploader
                pictures={this.file ? [this.file] : []}
                withCover
                singleImage
                withUrl
                onChange={this.onDropFile}
                onDelete={this.onDeleteFile}
                imgExtension={['.pdf']}
                maxFileSize={5242880} />
            </div>
            <div className='form-group actions'>
              <div className='col-sm-offset-2 col-sm-10'>
                <button style={{ margin: '20px' }} type='button' className='btn btn-success' onClick={this.saveGroup}>
                  <i className='glyphicon glyphicon-plus' />
                  &emsp;
                  {t('group.form.create.submit')}
                </button>
              </div>
            </div>
          </div>
          ), this.el[0].querySelector('.uploadJustificatory')
        )
      }
    })
  }
  onDrop = (images) => {
    let inputName = this.find('#coverUrl')
    if (!isEmpty(images)) {
      this.image = images
      inputName.value(this.image[0].url ? this.image[0].url : utils.buildUploadUrl(this.image[0].name))
    } else {
      this.onDelete()
    }
  }
  onDelete = () => {
    this.find('#coverUrl').value(null)
    this.image = null
  }
  onDropFile = (files) => {
    let inputName = this.find('#justificatory')
    if (!isEmpty(files)) {
      this.file = files
      inputName.value(this.file[0].url ? this.file[0].url : utils.buildUploadUrl(this.file[0].name))
    } else {
      this.onDeleteFile()
    }
  }
  onDeleteFile = () => {
    this.find('#justificatory').value(null)
    this.file = null
  }

  /**
   * Build view's `this.el`
   */

  switchOn () {
    this.on('success', this.bound('onsuccess'))
    this.bind('change', '[name="associationName"]', this.bound('onBlur'))
    this.bind('click', '.make-public', this.bound('onmakepublicclick'))
    this.bind('click', '.make-private', this.bound('onmakeprivateclick'))

    ReactRender((
      <ImageUploader
        pictures={this.image ? [this.image] : []}
        onChange={this.onDrop}
        onDelete={this.onDelete}
        withCover
        singleImage
        withUrl
        imgExtension={['.jpg', '.jpeg', '.png', '.gif']}
        maxFileSize={5242880} />
    ), this.el[0].querySelector('.uploadImg')
  )
  }
  saveGroup = (event) => {
    event.preventDefault()
    let groupId = this.find('#associationId')[0].value
    if (groupId === '') {
      let formFields = {
        name: this.find('#associationName')[0].value,
        justificatoryUrl: this.find('#justificatory')[0].value,
        users: []
      }
      request
  .post('/api/group/create', formFields)
  .end((err, res) => {
    if (err || !res.ok) {
      console.log(err)
    } else {
      console.log('new group created while creating forum' + res)
      this.find('#associationId').value(res.body.id)
    }
  })
      this.onsaveGroup()
    }
  }

  onsuccess (res) {
    if (this.image) {
      request
          .post('/api/v2/upload')
          .field(this.image)
          .end((err, res) => {
            if (err || !res.ok) {
              this.handleError([err || res.text])
            }
            this.onsave(res)
          })
    } else { this.onsave(res) }
  }

  onsave (res) {
    this.messages([t('admin-general.message.onsuccess')])
  }
  onmakepublicclick (ev) {
    ev.preventDefault()
    let view = this
    this.pubButton.addClass('disabled')

    forumStore.publish(this.options.forum.id)
      .then(() => {
        view.pubButton.removeClass('disabled').addClass('hide')
        view.privButton.removeClass('hide')
        console.log('published!!')
      })
      .catch((err) => {
        view.pubButton.removeClass('disabled')
        log('Found error %o', err)
      })
  }

  onmakeprivateclick (ev) {
    ev.preventDefault()
    let view = this

    this.privButton.addClass('disabled')

    forumStore.unpublish(this.options.forum.id)
      .then(() => {
        view.privButton.removeClass('disabled')
        view.privButton.addClass('hide')
        view.pubButton.removeClass('hide')
        console.log('Unpublished!!')
      })
      .catch((err) => {
        view.pubButton.removeClass('disabled')
        log('Found error %o', err)
      })
  }
  onsaveGroup () {
    this.messages([t('group.creation.message.onsuccess')])
  }
}
