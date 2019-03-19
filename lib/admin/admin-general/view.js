import t from 't-component'
import debug from 'debug'
import FormView from '../../form-view/form-view'
import forumStore from '../../stores/forum-store/forum-store'
import template from './template.jade'

const log = debug('democracyos:admin-topics-form')

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
    this.publish = this.find('button.make-public')
    this.unpublish = this.find('button.make-private')
  }

  /**
   * Build view's `this.el`
   */

  switchOn () {
    this.on('success', this.bound('onsuccess'))
    this.bind('click', '.make-public', this.bound('onPublish'))
    this.bind('click', '.make-private', this.bound('onUnpublish'))
  }

  onsuccess (res) {
    this.onsave()
  }

  onsave () {
    this.messages([t('admin-general.message.onsuccess')])
  }

  onPublish (ev) {
    ev.preventDefault()
    let view = this
    this.publish.addClass('disabled')

    forumStore.publish(this.options.forum.id)
      .then(() => {
        view.publish.removeClass('disabled').addClass('hide')
        view.unpublish.removeClass('hide')
      })
      .catch((err) => {
        view.publish.removeClass('disabled')
        log('Found error %o', err)
      })
  }

  onUnpublish (ev) {
    ev.preventDefault()
    let view = this

    this.unpublish.addClass('disabled')

    forumStore.unpublish(this.options.forum.id)
      .then(() => {
        view.unpublish.removeClass('disabled')
        view.unpublish.addClass('hide')
        view.publish.removeClass('hide')
      })
      .catch((err) => {
        view.publish.removeClass('disabled')
        log('Found error %o', err)
      })
  }
}
