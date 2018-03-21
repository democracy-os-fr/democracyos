/**
 * Module dependencies.
 */

import page from 'page'
import t from 't-component'
import FormView from '../../form-view/form-view.js'
import request from '../../request/request.js'
import whitelists from '../../whitelists/whitelists.js'
import template from './template.jade'

/**
 * Creates a password edit view
 */

export default class WhitelistForm extends FormView {
  constructor (options) {
    super(template, {
      form: {
        action: '/api/whitelists/' + (options.whitelist ? options.whitelist.id : 'create'),
        title: 'admin-whitelists-form.title.' + (options.whitelist ? 'edit' : 'create')
      },
      forum: options.forum,
      whitelist: options.whitelist || { new: true }
    })
  }

  switchOn () {
    this.on('success', this.bound('onsuccess'))
    this.on('submit', this.bound('onsubmit'))
    this.bind('click', '.btn-delete', this.bound('ondelete'))
  }

  /**
   * Handle `success` event
   *
   * @api private
   */

  onsuccess (res) {
    whitelists.fetch()
    whitelists.ready(this.bound('onsave'))
  }

  onsubmit () {
    let self = this
    let type = self.get('type')
    let validators = [
      'required',
      type + (self.locals.whitelist.id ? '' : 's')
    ]
    // setting the validator for 'value' based on 'type' (eg: email, domain ...)
    self.field('value').attr('validate', validators.join(' '))
  }

  onsave () {
    this.messages([t('admin-whitelists-form.message.onsuccess')])
  }

  ondelete () {
    let self = this
    request
      .del('/api/whitelists/:id'.replace(':id', self.locals.whitelist.id))
      .end(function (err, res) {
        if (err || !res.ok) {
          this.errors([err || res.text])
        }

        whitelists.fetch()
        page('/admin/users')
      })
  }
}
