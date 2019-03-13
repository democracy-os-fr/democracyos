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
    this.pubButton = this.find('a.make-public')
    this.privButton = this.find('a.make-private')
  }

  /**
   * Build view's `this.el`
   */

  switchOn () {
    this.on('success', this.bound('onsuccess'))
    this.bind('click', '.make-public', this.bound('onmakepublicclick'))
    this.bind('click', '.make-private', this.bound('onmakeprivateclick'))

  }

  onsuccess (res) {
    this.onsave()
  }

  onsave () {
    this.messages([t('admin-general.message.onsuccess')])
  }
  onmakepublicclick (ev) {
    ev.preventDefault()
    let view = this
    this.pubButton.addClass('disabled')

    forumStore.publish(this.options.forum.id)
      .then(() => {
        view.pubButton.removeClass('disabled').addClass('hide')
        view.privButton.removeClass('hide')
        console.log('published!!')
      })
      .catch((err) => {
        view.pubButton.removeClass('disabled')
        log('Found error %o', err)
      })
  }

  onmakeprivateclick (ev) {
    ev.preventDefault()
    let view = this

    this.privButton.addClass('disabled')

    forumStore.unpublish(this.options.forum.id)
      .then(() => {
        view.privButton.removeClass('disabled')
        view.privButton.addClass('hide')
        view.pubButton.removeClass('hide')
        console.log('Unpublished!!')
      })
      .catch((err) => {
        view.pubButton.removeClass('disabled')
        log('Found error %o', err)
      })
  }
}
