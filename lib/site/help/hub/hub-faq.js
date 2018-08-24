import React, { Component } from 'react'
import t from 't-component'
import urlBuilder from 'lib/url-builder'

export default class HubFAQ extends Component {
  constructor () {
    super()
    this.state = {
    }
  }
  componentDidMount () {

  }
  render () {
    return (
      <div className='Hub-info-container'>
        <h1 className='hub-faq-title' style={{ textAlign: 'center' }}> HUB FAQ</h1>
        <h5 className='hub-faq-info-title' style={{ textAlign: 'center', textDecoration: 'underline' }}>
          {t('footer-info')}
        </h5>
        <div className='hub-footer-roles'>
          <h5>
            <a href={urlBuilder.for('site.hub.particular.help')}>
              {t('footer-info-particular')}
            </a>
          </h5>
          <h5 >
            <a href={urlBuilder.for('site.hub.group.help')}>
              {t('footer-info-group')}
            </a>
          </h5>
        </div>
      </div>
    )
  }
  }
