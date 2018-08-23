import React from 'react'
import t from 't-component'
import urlBuilder from 'lib/url-builder'

const Footer = () => {
  return (
    <div className='hub-footer' >
      <h3 className='help'>
        {t('need-help')}
      </h3>
      <h5>
        {t('footer-info')}
      </h5>
      <div className='hub-footer-roles'>
        <h5>
          <a href={urlBuilder.for('system.hub.particular.help')}>
            {t('footer-info-particular')}
          </a>
        </h5>
        <h5 >
          <a href={urlBuilder.for('system.hub.group.help')}>
            {t('footer-info-group')}
          </a>
        </h5>
      </div>
      <div className='footer-faq'>
        <a href={urlBuilder.for('system.hub.faq')}>
          <button className='btn btn-success'>
            {t('footer-info-faq')}
          </button>
        </a>
      </div>
    </div>

  )
}
export default Footer
