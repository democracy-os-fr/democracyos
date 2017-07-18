/**
 * Module dependencies.
 */

import t from 't-component'
import List from 'democracyos-list.js'
import urlBuilder from 'lib/url-builder'
import FormView from '../../form-view/form-view'
import template from './template.jade'
import itemTemplate from './item.jade'

/**
 * Creates a list view of tags
 */

export default class UsersListView extends FormView {
  constructor (options = {}) {
    options.urlBuilder = urlBuilder
    options.form = { action: '/api/user/generate' }

    super(template, options)
    this.options = options
  }

  switchOn () {
    this.list = new List('users-wrapper', { valueNames: ['user-title'] })
    this.on('success', this.bound('generate'))
  }

  generate (res) {
    this.options.users.push(res.body)
    this.find('#users-wrapper .list').prepend(itemTemplate({
      urlBuilder: this.options.urlBuilder,
      user: res.body
    }))
    this.onsave()
  }

  onsave () {
    this.messages([t('system.users.message.onsuccess')])
  }
}
