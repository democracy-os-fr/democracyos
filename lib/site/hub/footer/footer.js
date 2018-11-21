import React from 'react'

const Footer = () => {
  return (
    <div className='hub-footer' >
      <div className='container-md' dangerouslySetInnerHTML={{ __html: require('./content.md') }} />
    </div>

  )
}
export default Footer
