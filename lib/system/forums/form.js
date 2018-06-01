import React from 'react'
import { render as ReactRender } from 'react-dom'
import ImageUploader from 'lib/common/uploader'
import { findIndex } from 'mout/array'
import request from 'lib/request/request.js'
import t from 't-component'
import page from 'page'
import urlBuilder from 'lib/url-builder'
import FormView from '../../form-view/form-view'
import template from './form.jade'

function imageName (pathOrName) { return pathOrName.split('\\').pop().split('/').pop() }
function equalsFileName (val1, val2) { return imageName(val1) === imageName(val2) }

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
    this.image = null
  }

  /**
   * Build view's `this.el`
   */

  switchOn () {
    this.on('success', this.bound('onsuccess'))
    ReactRender((
      <ImageUploader
        pictures={this.image ? [this.image.name] : []}
        withPreview
        singleImage
        onChange={this.onDrop}
        onDelete={this.onDelete}
        imgExtension={['.jpg', '.jpeg', '.png', '.gif']}
        maxFileSize={5242880} />
    ), this.el[0].querySelector('.uploadImg')
  )
  }
  onDelete = () => {
    this.find('#cover').value(null)
  }
  onDrop = (images) => {
    let inputName = this.find('#cover')
    for (var image of images) {
      if (findIndex(this.images, (_image) => equalsFileName(_image.name, image.name)) < 0) {
        this.image = image
        inputName.value(window.location.origin + '/uploads/' + image.name)
      }
    }
  }
  /**
   * Handle `success` event
   *
   * @api private
   */

  onsuccess = (res) => {
    // this.onsave()
    page.redirect(urlBuilder.for('admin.general', { forum: res.body.name }))
    if (this.options.forum.cover === '') {
      this.onsave()
    } else {
      request
    .post('/api/v2/upload')
    .field(this.image)
    .end((err, res) => {
      if (err || !res.ok) {
        this.handleError([err || res.text])
      }
      this.onsave()
    })
    }
  }

  onsave () {
    this.messages([t('admin-forums-form.message.onsuccess')])
  }
}
