import Log from 'debug'
import bus from 'bus'
import t from 't-component'
import List from 'democracyos-list.js'
import urlBuilder from 'lib/url-builder'
import FormView from '../../form-view/form-view'
import forumStore from '../../stores/forum-store/forum-store'
import template from './view.jade'
import itemTemplate from './item.jade'

const log = new Log('democracyos:system:forums:view')

export default class ForumsListView extends FormView {
  constructor (options = {}) {
    options.urlBuilder = urlBuilder
    options.form = { action: '/api/forum/generate' }
    super(template, options)
    this.options = options
    this.forumsList = this.find('.list')
    this.load()
  }

  switchOn () {
    this.list = new List('forums-wrapper', { valueNames: ['forum-title'] })
    this.on('success', this.bound('generate'))
    this.bind('click', 'button[name="forum-delete"]', this.bound('doDestroy'))
  }

  generate (res) {
    this.loadOne(res.body.name)
    this.onsave()
  }

  onsave () {
    this.messages([t('admin-tags-form.message.onsuccess')])
  }

  load () {
    forumStore.findAll({ 'privileges.canChangeTopics': true })
    .then((forums) => {
      if (!forums || !forums.length) return this.empty()
      forums.forEach(this.add, this)
      this.list = new List('forums-wrapper', { valueNames: ['forum-title'] })
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
        this.list.reIndex()
      }
    })
    .catch((err) => {
      log('Found Error %s', err)
    })
  }

  add (forum) {
    log(forum)
    this.forumsList.append(itemTemplate({
      urlBuilder: this.options.urlBuilder,
      forum: forum
    }))
    bus.once(`forum-store:destroy:${forum.id}`, (o) => {
      log('forum-store:destroy %o', o)
      console.log(o)
      console.log(this.list.get('forum-title', o.name))

      this.list.remove('forum-title', o.name)
      // if (!this.forumsList.html()) this.empty()
    })
  }

  empty () {
    this.forumsList.empty()
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
