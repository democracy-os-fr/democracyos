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
    this.on('success', this.bound('onsuccess'))
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
