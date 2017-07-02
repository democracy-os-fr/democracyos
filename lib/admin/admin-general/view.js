import t from 't-component'
import FormView from '../../form-view/form-view'
import template from './template.jade'

export default class GeneralForm extends FormView {
  constructor (forum) {
    var options = {
      form: {
        action: '/api/forum/' + forum.id,
        title: t('admin-general.form.title')
      },
      forum: forum
    }
    console.log(forum)
    super(template, options)
    this.options = options
  }

  /**
   * Build view's `this.el`
   */

  switchOn () {
    this.on('success', this.bound('onsuccess'))
  }

  onsuccess (res) {
    this.onsave()
  }

  onsave () {
    this.messages([t('admin-tags-form.message.onsuccess')])
  }
}
