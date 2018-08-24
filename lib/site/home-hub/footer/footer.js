import React from 'react'
import t from 't-component'
import urlBuilder from 'lib/url-builder'

const Footer = () => {
  return (
    <div className='hub-footer' >
      <h3 className='help'>
        {t('need-help')}
      </h3>
      <div className='footer-faq'>
        <a href={urlBuilder.for('site.hub.faq')}>
          <button className='btn btn-success'>
            {t('footer-info-faq')}
          </button>
        </a>
      </div>
    </div>

  )
}
export default Footer
