import React from 'react'
import { render as ReactRender } from 'react-dom'
import { findIndex } from 'mout/array'
import t from 't-component'
import ImageUploader from 'lib/common/uploader'
import request from 'lib/request/request.js'
import FormView from '../../form-view/form-view'
import template from './template.jade'

function imageName (pathOrName) { return pathOrName.split('\\').pop().split('/').pop() }
function equalsFileName (val1, val2) { return imageName(val1) === imageName(val2) }

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
    this.image = forum.coverUrl ? new File([], forum.coverUrl) : null
    console.dir(forum)
  }

  onDrop = (images) => {
    let inputName = this.find('#coverUrl')
    for (var image of images) {
      if (findIndex(this.images, (_image) => equalsFileName(_image.name, image.name)) < 0) {
        this.image = image

        inputName.value(window.location.origin + '/uploads/' + image.name)
      }
    }
  }
  handleChanged = (url) => {
    let inputName = this.find('#coverUrl')
    inputName.value(url)
  }
  onDelete = () => {
    // if (equalsFileName(this.image.name, name)) {
    //   this.find('#coverUrl').value(null)
    // }
    this.find('#coverUrl').value(null)
    this.image = null
  }

  /**
   * Build view's `this.el`
   */

  switchOn () {
    this.on('success', this.bound('onsuccess'))
    console.dir(this.image ? [{ url: this.image.name }] : [])
    ReactRender((
      <ImageUploader
        pictures={this.image ? [{ url: this.image.name }] : []}
        onChanged={this.handleChanged}
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
      this.onsave()
    } else {
      if (this.image) {
        request
      .post('/api/v2/upload')
      .field([this.image])
      .end((err, res) => {
        if (err || !res.ok) {
          this.handleError([err || res.text])
        }
        this.onsave()
      })
      } else { this.onsave() }
    }
  }

  onsave () {
    this.messages([t('admin-general.message.onsuccess')])
  }
}
