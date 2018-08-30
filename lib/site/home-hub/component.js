import React, { Component } from 'react'
import { Link } from 'react-router'
// import { Carousel } from 'react-bootstrap'
import t from 't-component'
// import debug from 'debug'
import config from 'lib/config'
import userConnector from 'lib/site/connectors/user'
import ForumsSection from './forums/component'
import GroupsSection from './groups/component'
import Footer from './footer/footer'

// const log = debug('democracyos:home-hub')

class HubHome extends Component {
  constructor (props) {
    super(props)

    this.state = {}
  }

  render () {
    const user = this.props.user.state.value || {}
    // const canManage = user.privileges && user.privileges.canManage
    const canCreate = (user.privileges && user.privileges.canCreate) ||
                      (config.multiForum && !config.restrictForumCreation)

    let info

    if (canCreate) {
      if (this.props.user.state.fulfilled) {
        // if (this.state.userHasForums && canManage) {
        //   info = (
        //     <div className='forum-info container'>
        //       <Link to={urlBuilder.for('settings.forums')} className='admin'>
        //         {t('newsfeed.call-to-action.manage-forums')}
        //         <span className='icon-arrow-right' />
        //       </Link>
        //     </div>
        //   )
        // }
        // else {
        //   info = (
        //     <div className='forum-info cover container'>
        //       <div className='content'>
        //         <h1>{t('newsfeed.welcome.title')}</h1>
        //         <p>{t('newsfeed.welcome.body')}</p>
        //         <Link
        //           to={urlBuilder.for('forums.new')}
        //           className='btn btn-default'>
        //           {t('newsfeed.call-to-action.start-a-forum')}
        //           <span className='icon-arrow-right' />
        //         </Link>
        //       </div>
        //     </div>
        //   )
        // }
      } else {
        info = (
          <div className='forum-info cover container'>
            <div className='content'>
              <h1>{t('newsfeed.welcome.title')}</h1>
              <p>{t('newsfeed.welcome.body')}</p>
              <Link to='/signup' className='btn btn-default'>
                {t('newsfeed.welcome.join')}
                <span className='icon-arrow-right' />
              </Link>
            </div>
          </div>
        )
      }
    }

    return (
      <div className='container'>
        {info}
        <div id='hub-description' className='container-md hub-description'
          dangerouslySetInnerHTML={{ __html: require('./description.md') }} />
        <GroupsSection user={this.props.user} />
        <ForumsSection user={this.props.user} />
        <Footer />
      </div>
    )
  }
}

export default userConnector(HubHome)
