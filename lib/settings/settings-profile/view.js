import React from 'react'
import { render as ReactRender } from 'react-dom'
import isEmpty from 'mout/lang/isEmpty'
import debug from 'debug'
import t from 't-component'
import utils from 'lib/common/uploader/utils'
import ImageUploader from 'lib/common/uploader'
import request from 'lib/request/request.js'
import user from '../../user/user.js'
import FormView from '../../form-view/form-view'
import config from '../../config/config'
import template from './template.jade'

let log = debug('democracyos:settings-profile')

export default class ProfileForm extends FormView {
  /**
   * Creates a profile edit view
   */

  constructor () {
    super(template)

    this.image = user.avatar ? {
      name: utils.imageName(user.avatar),
      url: user.avatar
    } : null
  }

  /**
   * Turn on event bindings
   */

  switchOn () {
    this.on('change', this.bound('onDrop'))
    this.on('success', this.bound('onsuccess'))

    // Locale

    this.locales = this.find('select#locale')[0]

    config.availableLocales.forEach((locale) => {
      var option = document.createElement('option')
      option.value = locale
      option.innerHTML = t(`settings.locale.${locale}`)
      this.locales.appendChild(option)
    })

    this.locales.value = user.locale || config.locale

    var selected = this.find(`option[value="${this.locales.value}"]`)
    selected.attr('selected', true)
    ReactRender((
      <ImageUploader
        pictures={this.image ? [this.image] : []}
        onChange={this.onDrop}
        onDelete={this.onDelete}
        withPreview
        withUrl
        singleImage
        imgExtension={['.jpg', '.jpeg', '.png', '.gif']}
        maxFileSize={5242880} />
    ), this.el[0].querySelector('.uploadImg')
  )
    // Age

    if (config.extra.user.age) {
      this.ages = this.find('select#age')[0]
      this.ages.appendChild(document.createElement('option'))
      for (let i = 1; i <= 5; i += 1) {
        let option = document.createElement('option')
        option.value = i
        option.innerHTML = t(`user.extra.age.short.${i}`)
        this.ages.appendChild(option)
      }

      let selectedAge
      if (user.extra && user.extra.age) {
        this.ages.value = user.extra.age
        selectedAge = this.find(`select#age option[value="${this.ages.value}"]`)
        selectedAge.attr('selected', true)
      } else {
        selectedAge = this.find(`select#age option[value="0"]`)
        selectedAge.attr('selected', true)
      }
    }

    // Job

    if (config.extra.user.job) {
      this.jobs = this.find('select#job')[0]
      this.jobs.appendChild(document.createElement('option'))
      for (let i = 1; i <= 8; i += 1) {
        let option = document.createElement('option')
        option.value = i
        option.innerHTML = t(`user.extra.job.${i}`)
        this.jobs.appendChild(option)
      }

      let selectedJob
      if (user.extra && user.extra.job) {
        this.jobs.value = user.extra.job
        selectedJob = this.find(`select#job option[value="${this.jobs.value}"]`)
        selectedJob.attr('selected', true)
      } else {
        selectedJob = this.find(`select#job option[value="0"]`)
        selectedJob.attr('selected', true)
      }
    }
  }

  /**
   * Turn off event bindings
   */

  switchOff () {
    this.off()
  }

  onDrop = (images) => {
    let inputName = this.find('#profilePic')
    if (!isEmpty(images)) {
      this.image = images
      inputName.value(this.image[0].url ? this.image[0].url : utils.buildUploadUrl(this.image[0].name))
    } else {
      this.onDelete()
    }
  }

  onDelete = () => {
    this.find('#profilePic').value(null)
    this.image = null
  }

  onsuccess () {
    log('Profile updated')
    user.load('me')

    user.once('loaded', () => {
      this.find('img').attr('src', user.profilePicture())
      this.messages([t('settings.successfuly-updated')], 'success')

      if (user.locale && user.locale !== config.locale) {
        setTimeout(function () {
          window.location.reload()
        }, 10)
      }
    })
    if (this.image) {
      request
      .post('/api/v2/upload')
      .field(this.image)
      .end((err, res) => {
        if (err || !res.ok) {
          this.handleError([err || res.text])
        }
      })
    }
    window.location.reload()
  }

  /**
   * Sanitizes form input data. This function has side effect on parameter data.
   * @param  {Object} data
   */

  postserialize (data) {
    data.firstName = data.firstName.trim().replace(/\s+/g, ' ')
    data.lastName = data.lastName.trim().replace(/\s+/g, ' ')
    data.username = data.username.trim().replace(/\s+/g, ' ')
  }
}
