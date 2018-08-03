import React from 'react'
import { render as ReactRender } from 'react-dom'
// import { findIndex } from 'mout/array'
import t from 't-component'
import page from 'page'
import isEmpty from 'mout/lang/isEmpty'
import ImageUploader from 'lib/common/uploader'
import utils from 'lib/common/uploader/utils'
import request from 'lib/request/request.js'
import urlBuilder from 'lib/url-builder'
import FormView from '../../form-view/form-view'
import template from './form.jade'

export default class ForumForm extends FormView {
  constructor (forum) {
    var action, title
    if (forum) {
      action = '/api/forum/copy'
      title = 'forum.form.title.copy'
      if (forum.topicsAttrs) {
        var map = {}
        for (var attr of forum.topicsAttrs) {
          map[attr.name] = true
        }
        forum.topicsAttrs = map
      }
    } else {
      action = '/api/forum'
      title = 'forum.form.title.create'
    }
    var options = {
      form: { action, title },
      forum: forum
    }

    super(template, options)
    this.options = options
    this.image = (forum && forum.coverUrl) ? {
      name: utils.imageName(forum.coverUrl),
      url: forum.coverUrl
    } : null
    this.file = (forum && forum.justificatoryUrl) ? {
      name: utils.imageName(forum.justificatoryUrl),
      url: forum.justificatoryUrl
    } : null
  }

  /**
   * Build view's `this.el`
   */

  switchOn () {
    this.on('success', this.bound('onsuccess'))
    this.bind('change', '[name="associationName"]', this.bound('onBlur'))
    ReactRender((
      <ImageUploader
        pictures={this.image ? [this.image] : []}
        withCover
        singleImage
        withUrl
        onChange={this.onDrop}
        onDelete={this.onDelete}
        imgExtension={['.jpg', '.jpeg', '.png', '.gif']}
        maxFileSize={5242880} />
      ), this.el[0].querySelector('.uploadImg')
    )
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
                <button type='button' className='btn btn-success' onClick={this.saveGroup}><i className='glyphicon glyphicon-plus' />
add group
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
    let inputName = this.find('#cover')
    if (!isEmpty(images)) {
      this.image = images
      inputName.value(this.image[0].url ? this.image[0].url : utils.buildUploadUrl(this.image[0].name))
    } else {
      this.onDelete()
    }
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
  onDelete = () => {
    this.find('#cover').value(null)
    this.image = null
  }
  onDeleteFile = () => {
    this.find('#justificatory').value(null)
    this.file = null
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

  /**
   * Handle `success` event
   *
   * @api private
   */

  onsuccess = (res) => {
    if (this.file) {
      request
      .post('/api/v2/upload')
      .field(this.file)
      .end((err, res) => {
        if (err || !res.ok) {
          this.handleError([err || res.text])
        }
      })
    }
    if (this.image) {
      request
      .post('/api/v2/upload')
      .field(this.image)
      .end((err, res) => {
        if (err || !res.ok) {
          this.handleError([err || res.text])
        }
      })
      page.redirect(urlBuilder.for('admin.general', { forum: res.body.name }))
    } else {
      page.redirect(urlBuilder.for('admin.general', { forum: res.body.name }))
    }
  }

  onsave () {
    this.messages([t('admin-forums-form.message.onsuccess')])
  }
  onsaveGroup () {
    this.messages([t('group.creation.message.onsuccess')])
  }
}
