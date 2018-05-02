/**
 * Module dependencies.
 */

import page from 'page'
import List from 'democracyos-list.js'
import urlBuilder from 'lib/url-builder'
import View from 'lib/view/view'
import request from '../../request/request.js'
import whitelists from '../../whitelists/whitelists.js'
import template from './template.jade'

/**
 * Creates `AdminUsers` view for admin
 */

export default class AdminWhitelists extends View {
  constructor (options) {
    super(template, {
      forum: options.forum,
      whitelists: options.whitelists,
      urlBuilder })
  }

  switchOn () {
    this.list = new List('whitelists-wrapper', {
      valueNames: ['whitelist-title', 'whitelist-id']
    })
    this.bind('click', '.btn.delete-whitelist', this.bound('onDelete'))
  }

  onDelete (ev) {
    ev.preventDefault()
    const el = ev.delegateTarget.parentElement
    const id = el.getAttribute('data-id')
    const list = this.list
    request
    .del('/api/whitelists/:id'.replace(':id', id))
    .end(function (err, res) {
      if (err || !res.ok) {
        this.errors([err || res.text])
      }

      whitelists.fetch()
      list.remove('whitelist-id', id)
    })
  }
}
