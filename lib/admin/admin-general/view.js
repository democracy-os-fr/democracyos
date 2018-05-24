import React from 'react'
import { render as ReactRender } from 'react-dom'
import ImageUploader from 'lib/common/uploader'
import t from 't-component'
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
  }
  onDrop =(image) => {
    console.log('onDrop')
    console.dir(image)
    var inputName = this.find('#coverUrl')
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

  /**
   * Build view's `this.el`
   */

  switchOn () {
    this.on('change', this.bound('onDrop'))
    this.on('success', this.bound('onsuccess'))
    ReactRender((
      <ImageUploader
        onChange={this.onDrop}
        imgExtension={['.jpg', '.jpeg', '.png', '.gif']}
        maxFileSize={5242880} />
    ), this.el[0].querySelector('.uploadImg')
  )
  }

  onsuccess (res) {
    this.onsave()
  }

  onsave () {
    this.messages([t('admin-general.message.onsuccess')])
  }
}
