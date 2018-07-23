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
    ReactRender((
      <ImageUploader
        pictures={this.file ? [this.file] : []}
        withCover
        singleImage
        withUrl
        onChange={this.onDropFile}
        onDelete={this.onDeleteFile}
        imgExtension={['.pdf']}
        maxFileSize={5242880} />
      ), this.el[0].querySelector('.uploadJustificatory')
    )
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
}
