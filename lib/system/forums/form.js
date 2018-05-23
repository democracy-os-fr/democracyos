import React from 'react'
import { render as ReactRender } from 'react-dom'
import ImageUploader from 'lib/common/uploader'
import request from 'lib/request/request.js'
import t from 't-component'
import page from 'page'
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
  }

  /**
   * Build view's `this.el`
   */

  switchOn () {
    this.on('change', this.bound('onDrop'))
    this.on('success', this.bound('onsuccess'))
    this.on('submit', this.bound('onsubmit'))
    ReactRender((
      <ImageUploader
        onChange={this.onDrop}
        imgExtension={['.jpg', '.jpeg', '.png', '.gif']}
        maxFileSize={5242880} />
    ), this.el[0].querySelector('.uploadImg')
  )
  }
  onDrop = (image) => {
    console.log('onDrop')
    console.dir(image)

    var inputName = this.find('#cover')

    request
    .post('/api/v2/upload')
    .field(image)
    .end((err, res) => {
      if (err || !res.ok) {
        this.handleError([err || res.text])
      }
      inputName.value(window.location.origin + '/uploads/' + image[0].name)
    })
  }

  onsubmit () {
    console.log('onsubmit')
    return false
  }

  /**
   * Handle `success` event
   *
   * @api private
   */

  onsuccess (res) {
    // this.onsave()
    page.redirect(urlBuilder.for('admin.general', { forum: res.body.name }))
  }

  onsave () {
    this.messages([t('admin-forums-form.message.onsuccess')])
  }
}
