import t from 't-component'
import FormView from '../../form-view/form-view'
import template from './form.jade'

export default class TagForm extends FormView {
  constructor (forum) {
    var action = '/api/forum/'
    var title
    if (forum) {
      action += forum.id
      title = 'admin-forums-form.title.edit'
    } else {
      action += 'create'
      title = 'admin-forums-form.title.create'
    }

    var options = {
      form: { title: title, action: action },
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
    this.onsave()
  }

  onsave () {
    this.messages([t('admin-forums-form.message.onsuccess')])
  }
}
