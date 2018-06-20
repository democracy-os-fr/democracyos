import React from 'react'
import { render as ReactRender } from 'react-dom'
// import { findIndex } from 'mout/array'
import t from 't-component'
import page from 'page'
import ImageUploader from 'lib/common/uploader'
import request from 'lib/request/request.js'
import urlBuilder from 'lib/url-builder'
import FormView from '../../form-view/form-view'
import template from './form.jade'

// function imageName (pathOrName) { return pathOrName.split('\\').pop().split('/').pop() }
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
    this.image = null
    if (forum && this.forum.coverUrl) { this.image = new File([], this.forum.coverUrl) } else { this.image = null }
  }

  /**
   * Build view's `this.el`
   */

  switchOn () {
    this.on('success', this.bound('onsuccess'))
    ReactRender((
      <ImageUploader
        pictures={this.image ? [{ url: this.image.name }] : []}
        withPreview
        singleImage
        withUrl
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
  onDrop =(image) => {
    var inputName = this.find('#cover')
    inputName.value(window.location.origin + '/uploads/' + image[0].name)
    this.image = image
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
