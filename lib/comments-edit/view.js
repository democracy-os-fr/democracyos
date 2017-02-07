import FormView from '../form-view/form-view.js';
import template from './template.jade';
import submit from '../submit';
import t from 't-component';
import o from 'component-dom';

import medium from 'medium-editor';

export default class CommentsEditView extends FormView {
  constructor (comment) {
    super(template, { comment: comment });
    this.comment = comment;
    this.form = this.find('form')[0];
  }

  /**
   * Switch on events
   *
   * @api public
   */

  switchOn () {
    this.bind('click', '.btn-cancel', 'oncancel');
    this.bind('keydown', 'textarea', 'onkeydown');
    this.on('success', this.bound('onsuccess'));
    var editor2 = new medium('#f-text-edit',{
      elementsContainer: o('#hidden-plugin-container')[0],
      buttonLabels: 'fontawesome',
      placeholder: {
          text: t('comments.your.placeholder'),
          hideOnClick: true
      }
    });
  }

  /**
   * Submit if meta key is pressed
   *
   * @param  {Event} ev keydown event
   */

  onkeydown (ev) {
    if (13 === ev.keyCode && (ev.metaKey || ev.ctrlKey)) {
      submit(this.form);
    }
  }

  /**
   * Put a comment
   *
   * @param {Object} data
   * @api public
   */

  onsuccess (res) {
    this.emit('put', res.body);
  }

  /**
   * On cancel editing a comment
   *
   * @param {Object} data
   * @api public
   */

  oncancel (ev) {
    ev.preventDefault();
    this.el.removeClass('edit');
    this.remove();
  }
}
