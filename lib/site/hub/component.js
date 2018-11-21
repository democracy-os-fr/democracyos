import React, { Component } from 'react'
import { Link } from 'react-router'
// import { Carousel } from 'react-bootstrap'
import t from 't-component'
// import debug from 'debug'
import config from 'lib/config'
import userConnector from 'lib/site/connectors/user'
import ForumsSection from './forums/component'
import GroupSection from './group/component'
import Footer from './footer/footer'

// const log = debug('democracyos:hub')

class HubHome extends Component {
  constructor (props) {
    super(props)

    this.state = {}
  }

  render () {
    // const user = this.props.user.state.value || {}
    // const canManage = user.privileges && user.privileges.canManage
    // const canCreate = (user.privileges && user.privileges.canCreate) || (config.multiForum && !config.restrictForumCreation)
    // display info --> (canCreate && this.props.user.state.fulfilled)

    return (

      <div className='hub'>
        <div className='forum-info cover'>
          <div className='content'>
            <div className='container-md' dangerouslySetInnerHTML={{ __html: require('./cover.md') }} />
          </div>
        </div>
        <div className='container'>
          <div className='container-md hub-description' dangerouslySetInnerHTML={{ __html: require('./description.md') }} />
          <div className='container-md'>
            <GroupSection user={this.props.user} />
            <ForumsSection user={this.props.user} />
          </div>
        </div>
        <Footer />
      </div>
    )
  }
}

export default userConnector(HubHome)
