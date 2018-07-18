import Log from 'debug'
import bus from 'bus'
import t from 't-component'
import List from 'democracyos-list.js'
import urlBuilder from 'lib/url-builder'
import user from '../../user/user'
import FormView from '../../form-view/form-view'
import forumStore from '../../stores/forum-store/forum-store'
import template from './view.jade'
import itemTemplate from './item.jade'

const log = new Log('democracyos:system:forums:view')
const mapping = ['forum-title', 'forum-name']

export default class ForumsListView extends FormView {
  constructor (options = {}) {
    options.urlBuilder = urlBuilder
    options.form = { action: '/api/forum/generate' }
    options.user = user
    super(template, options)
    this.options = options
    this.forumsList = this.find('.list')
  }

  switchOn () {
    this.load()
    this.find('#forums-wrapper form').on('keypress', this.bound('noSubmitOnEnter'))
    this.on('success', this.bound('generate'))
    this.bind('input', 'input[name="forum-delete-input"]', this.bound('onModalInputChange'))
    this.bind('click', 'button[name="forum-delete"]', this.bound('doDestroy'))
  }

  generate (res) {
    this.loadOne(res.body.name)
    this.onsave()
  }

  onsave () {
    this.messages([t('admin-tags-form.message.onsuccess')])
  }

  noSubmitOnEnter (e) {
    const txtArea = /textarea/i.test((e.target || e.srcElement).tagName)
    if (txtArea || (e.keyCode || e.which || e.charCode || 0) === 13) {
      e.preventDefault()
      return false
    }
  }

  load () {
    let options = user.staff ? { staff: true } : { 'privileges.canChangeTopics': true }
    forumStore.findAll(options)
    .then((forums) => {
      if (!forums || !forums.length) return this.empty()
      forums.forEach(this.add, this)
      this.list = new List('forums-wrapper', { valueNames: mapping })
    })
    .catch((err) => {
      if (err.status === 404) {
        this.empty()
      } else {
        log('Found Error %s', err)
      }
    })
  }

  loadOne (name) {
    forumStore.findOneByName(name)
    .then((forum) => {
      if (forum) {
        this.add(forum)
        this.list = new List('forums-wrapper', { valueNames: mapping })
      }
    })
    .catch((err) => {
      log('Found Error %s', err)
    })
  }

  add (forum) {
    this.forumsList.append(itemTemplate({
      urlBuilder: this.options.urlBuilder,
      forum,
      user,
      t
    }))
    bus.once(`forum-store:destroy:${forum.id}`, (o) => {
      this.list.remove('forum-name', `/${o.name}`)
      this.list = new List('forums-wrapper', { valueNames: mapping })
      this.unloading()
    })
  }

  empty () {
    this.forumsList.empty()
  }

  onModalInputChange (e) {
    let { id, name } = e.delegateTarget.dataset
    let input = this.find(`#forum-delete-modal-${id} input[name="forum-delete-input"]`)
    let button = this.find(`#forum-delete-modal-${id} button[name="forum-delete"]`)
    if (input.val() === name) {
      button.attr('disabled', null)
    } else {
      button.attr('disabled', true)
    }
  }

  doDestroy (e) {
    this.loading()
    let id = e.delegateTarget.dataset.forumId
    forumStore.destroy(id)
    .then(() => {
      this.unloading()
      window.analytics.track('delete forum', { forum: id }) // TODO : this.forum.name
    })
    .catch(() => {
      this.unloading()
    })
  }
}
