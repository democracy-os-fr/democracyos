import o from 'component-dom';
import t from 't-component';
import debug from 'debug';
import loading from 'democracyos-loading-lock';
import user from '../user/user';
import config from '../config/config';
import CommentCard from '../comment-card/view';
import CommentsFilter from '../comments-filter/view';
import FormView from '../form-view/form-view';
import template from './template.jade';
import closest from 'component-closest';
import commentStore from '../comment-store/comment-store';
import analytics from '../analytics';
import isEmpty from 'mout/lang/isEmpty';
import Toggle from 'democracyos-toggle';
import shuffle from 'mout/array/shuffle';

import Medium from 'medium-editor';

let log = debug('democracyos:comments-view');

export default class CommentsView extends FormView {

  /**
   * Creates a CommentsView
   *
   * @param {String} reference
   */

  constructor (options) {
    super(template, options);
    this.item = options.item;
    this.roles = options.roles;
    this.options = options;

    this.page = 0;
    this.filter = new CommentsFilter();
    this.sort = this.filter.getSort();
    this.filter.appendTo(this.find('.filter-container .sort-container')[0]);

    this.comments = [];
    this.mycomments = [];
    this.form = this.find('#form .comment-form');
    this.textarea = this.form.find('textarea');
    this.alias = this.form.find('input[name="alias"]');
    this.asAlias = this.form.find('input[name="asAlias"]');
    this.peopleCount = this.form.find('input[name="peopleCount"]');

    this.toggleOwn = false ;

    // let toggle = new Toggle();
    // toggle.label(t('settings-notifications.yes'), t('settings-notifications.no'));
    // toggle.name(name);
    // if (user.notifications[name]) toggle.value(true);
    // let el = self.el.find('.' + name);
    // el.prepend(toggle.el);


  }

  initialize () {
    this.initializeComments();
    this.initializeMyComments();
  }

  /**
   * Load initial set of comments
   *
   * @api public
   */

  initializeComments () {
    this.page = 0;
    this.comments = [];
    this.find('btn.load-comments').addClass('hide');

    let query = {
      topicId: this.item.id,
      count: true,
      sort: this.sort
    };

    commentStore
      .findAll(query)
      .then(count => {
        this.count = count;
        this.fetch();
      })
      .catch(err => {
        log('Fetch error: %s', err);
        return;
      });
  }

  /**
   * Load user's comments
   *
   * @api public
   */

  initializeMyComments () {
    if (user.id) {
      commentStore
        .findUserComments({
          topicId: this.item.id,
          sort: this.sort
        })
        .then(comments => {
          this.emit('fetch my comments', comments);
        })
        .catch(err => {
          log('Fetch response error: %s', err);
        });
    }
  }

  /**
   * Fetch comments
   *
   * @api public
   */

  fetch () {
    this.loadingComments();

    let query = {
      topicId: this.item.id,
      page: this.page,
      sort: (this.sort !== 'random') ? this.sort : 'upvote',
      limit: config.commentsPerPage
    };

    commentStore
      .findAll(query)
      .then(comments => {

        if(this.sort === 'random'){
          comments = shuffle(comments);
        }

        this.unloadingComments();
        this.emit('fetch', comments);
      })
      .catch(err => {
        this.unloadingComments();
        log('Fetch error: %s', err);
      });
  }

  refreshForm (){
    if( this.asAlias[0] ){

      if( this.asAlias[0].checked && jQuery('.people-count-row').hasClass('hide') ) {
        jQuery('.people-count-row').removeClass('hide');
      } else if ( !this.asAlias[0].checked && !jQuery('.people-count-row').hasClass('hide')) {
        jQuery('.people-count-row').addClass('hide');
      }

    }
  }

  switchOn () {
    this.bind('click', '.new-comment', 'showNewComment');
    this.bind('click', '.cancel-new-comment', 'hideNewComment');
    this.bind('click', '.load-comments', 'fetch');
    this.on('success', this.bound('onsuccess'));
    this.on('fetch', this.bound('load'));
    this.on('fetch my comments', this.bound('loadMyComments'));
    this.on('post', this.bound('addmycomment'));
    this.on('no more comments', this.nomorecomments.bind(this));
    this.on('more comments', this.morecomments.bind(this));
    this.filter.on('change', this.bound('onfilterchange'));

    jQuery('.comments-nav').find('a[href="#all"], a[href="#user"]').on('shown.bs.tab', () => {
      this.find('.filter-container').removeClass('hide');
    });

    this.bind('change', '.comments-own input[type="checkbox"]' , 'toggleUserComments');


    this.alias.on('keyup', () => {
      jQuery('.comment-form').find('input[name="asAlias"]').prop('checked', !isEmpty(this.alias.value()));
      this.refreshForm();
    });

    this.asAlias.on('change', () => {
      this.refreshForm();
    });


    this.editor = new Medium('#f-text', {
      elementsContainer: o('#hidden-plugin-container')[0],
      buttonLabels: 'fontawesome',
      placeholder: {
        text: t('comments.your.placeholder'),
        hideOnClick: true
      }
    });

    this.refreshForm();

  };

  switchOff () {
    this.filter.off('change', this.bound('onfilterchange'));
  };


  toggleUserComments(ev){

    this.toggleOwn = !this.toggleOwn ;
    if(this.toggleOwn){
      jQuery('.comments-nav a[href="#user"]').tab('show');
    } else {
      jQuery('.comments-nav a[href="#all"]').tab('show');
    }
  }

  /**
   * Load comments in view's `el`
   *
   * @param {Array} comments
   * @api public
   */

  loadMyComments (comments) {
    let existing = this.find('.no-comments');
    if (existing.length) existing.remove();

    console.log('loadMyComments');

    this.find('.my-comments li.comment-item').remove();

    if (comments.length) {
      comments.forEach(this.bound('addmycomment'));
    } else {
      let span = o('<div></div>');
      let text = t('comments.no-user-comments');
      span.html(text).addClass('no-comments');
      this.find('.my-comments-list').append(span[0]);
    }
  };

  /**
   * Load comments in view's `el`
   *
   * @param {Array} comments
   * @api public
   */

  load (comments) {
    if( !comments.length ) return this.refreshState();

    log('load %o', comments);

    var els = this.find('.all-comments li.comment-item');

    this.add(comments);

    if (!this.page) {
      els.remove();
    }

    if (this.comments.length === this.count) {
      this.emit('no more comments');
    } else {
      this.emit('more comments');
    }

    this.refreshState();

    this.page += 1;
    this.emit('load');
  };

  refreshState(){
    if (!this.comments.length || 1 === this.comments.length) {
      this.filter.el.addClass('hide');
    } else {
      this.filter.el.removeClass('hide');
    }

    if (!this.comments.length) {
      this.find('.comments-own').addClass('hide');
    } else {
      this.find('.comments-own').removeClass('hide');
    }

    if (!this.comments.length) {
      let span = o('<div></div>');
      let text = t('comments.no-comments');
      span.html(text).addClass('no-comments');
      let existing = this.find('.no-comments');
      if (existing.length) existing.remove();
      this.find('.comments-list').append(span[0]);
      return this.emit('no more comments');
    }
  };

  add (comment) {
    var self = this;

    if (Array.isArray(comment)) {
      comment.forEach((c) => self.add(c));
      return;
    }

    var card = new CommentCard(comment, this.options);
    this.comments.push(comment);
    var container = this.find('.comments-list');

    card.appendTo(container);
    card.on('delete', function(){
      self.comments.splice(self.comments.indexOf(comment), 1);
      self.bound('refreshState')();
    });
  }

  addmycomment (comment) {
    let card = new CommentCard(comment, this.options);
    let container = this.find('.my-comments-list')[0];
    this.mycomments.push(comment);
    card.appendTo(container);
    card.on('delete', this.bound('removemycomment'));
  }

  removemycomment (comment) {
    let i = this.mycomments.indexOf(comment);
    this.mycomments.splice(i, 1);
  }

  onsuccess (res) {

    console.log(res.body);

    this.add(res.body);
    this.addmycomment(res.body);
    this.hideNewComment();
    this.track(res.body);
  }

  track(comment) {
    analytics.track('comment', {
      comment: comment.id
    });
  }

  showNewComment (ev) {
    ev.preventDefault();

    this.find('.filter-container').addClass('hide');
    jQuery('.comments-nav a[href="#form"]').tab('show');
    this.form[0].scrollIntoView();
  }

  hideNewComment () {

    this.editor.resetContent();
    this.alias.val('');
    this.peopleCount.val('');
    // this.find('.filter-container').removeClass('hide');
    jQuery('.comments-nav a[href="#all"]').tab('show');

    this.find('span.error').remove();
    this.find('.error').removeClass('error');
  }

  /**
   * Display a spinner when loading comments
   *
   * @api public
   */

  loadingComments () {
    this.list = this.find('.all-comments')[0];
    this.loadingSpinner = loading(this.list, { size: 100 }).lock();
  }

  /**
   * Remove spinner when comments are loaded
   */

  unloadingComments () {
    this.loadingSpinner.unlock();
  }

  /**
   * When there are more comments to show
   *
   * @api public
   */

  morecomments () {
    this.find('.load-comments').removeClass('hide');
  }

  /**
   * When there are no more comments to show
   *
   * @api public
   */

  nomorecomments () {
    this.find('.load-comments').addClass('hide');
  }

  /**
   * When comments filter change,
   * re-fetch comments
   *
   * @api public
   */

  onfilterchange () {
    this.sort = this.filter.getSort();
    this.initializeComments();
    this.initializeMyComments();
  }

}
