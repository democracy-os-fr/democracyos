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

function imageName (pathOrName) { return pathOrName.split('\\').pop().split('/').pop() }
// function equalsFileName (val1, val2) { return imageName(val1) === imageName(val2) }

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
      name: imageName(forum.coverUrl),
      url: forum.coverUrl
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
  }

  onDrop = (images) => {
    let inputName = this.find('#cover')
    if (!isEmpty(images)) {
      this.image = images[0]
      inputName.value(this.image.url ? this.image.url : utils.buildUploadUrl(this.image.name))
    } else {
      this.onDelete()
    }
  }

  onDelete = () => {
    this.find('#cover').value(null)
    this.image = null
  }
  /**
   * Handle `success` event
   *
   * @api private
   */

  onsuccess = (res) => {
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
    // this.onsave()
    const forum = res.body.name
    if (this.image) {
      request
      .post('/api/v2/upload')
      .field(this.image)
      .end((err, res) => {
        if (err || !res.ok) {
          this.handleError([err || res.text])
        }
        page.redirect(urlBuilder.for('admin.general', { forum }))
      })
    } else {
      page.redirect(urlBuilder.for('admin.general', { forum }))
    }
  }

  onsave () {
    this.messages([t('admin-forums-form.message.onsuccess')])
  }
}
