import React from 'react'
import { render as ReactRender } from 'react-dom'
import t from 't-component'
import utils from 'lib/common/uploader/utils'
import ImageUploader from 'lib/common/uploader'
import request from 'lib/request/request.js'
import FormView from '../../form-view/form-view'
import template from './template.jade'

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
    this.image = forum.coverUrl ? {
      name: utils.imageName(forum.coverUrl),
      url: forum.coverUrl
    } : null
  }

  onDrop = (images) => {
    let inputName = this.find('#coverUrl')
    if (!isEmpty(images)) {
      this.image = images[0]
      inputName.value(this.image.url ? this.image.url : utils.buildUploadUrl(this.image.name))
    } else {
      this.onDelete()
    }
  }

  onDelete = () => {
    this.find('#coverUrl').value(null)
    this.image = null
  }

  /**
   * Build view's `this.el`
   */

  switchOn () {
    this.on('success', this.bound('onsuccess'))
    ReactRender((
      <ImageUploader
        pictures={this.image ? [this.image] : []}
        onChange={this.onDrop}
        onDelete={this.onDelete}
        withPreview
        singleImage
        withUrl
        imgExtension={['.jpg', '.jpeg', '.png', '.gif']}
        maxFileSize={5242880} />
    ), this.el[0].querySelector('.uploadImg')
  )
  }

  onsuccess (res) {
    if (this.options.forum.coverUrl === '') {
      this.onsave(res)
    } else {
      if (this.image) {
        console.dir(this.image)
        request
        .post('/api/v2/upload')
        .field([this.image])
        .end((err, res) => {
          if (err || !res.ok) {
            this.handleError([err || res.text])
          }
          this.onsave(res)
        })
      } else { this.onsave(res) }
    }
  }

  onsave (res) {
    this.messages([t('admin-general.message.onsuccess')])
  }
}
