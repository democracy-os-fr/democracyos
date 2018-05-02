import React, { Component } from 'react'
import { Link } from 'react-router'
import t from 't-component'
import debug from 'debug'
// import sort from 'lib/sorts/forum'
import config from 'lib/config'
import urlBuilder from 'lib/url-builder'
import userConnector from 'lib/site/connectors/user'
import List from 'lib/common/list'
import forumStore from '../../stores/forum-store/forum-store'

const log = debug('democracyos:home')

class Home extends Component {
  constructor (props) {
    super(props)

    this.state = {
      userHasForums: false,
      loadingUserForms: false
    }
  }

  componentWillMount () {
    // Get user forums for permissions checking
    this.getUserForums()
  }

  componentWillUnmount () {
    forumStore.clear()
  }

  getUserForums = () => {
    this.setState({ loadingUserForms: true })

    forumStore.findAll({
      'privileges.canView': true
    }).then((forums) => {
      this.setState({
        userHasForums: forums && forums.length > 0,
        loadingUserForms: false
      })
    }).catch((err) => {
      if (err.status !== 400) throw err
      this.setState({
        userHasForums: false,
        loadingUserForms: false
      })
    })
  }

  render () {
    if (this.state.loadingUserForms) return null
    if (this.props.user.state.pending) return null

    const user = this.props.user.state.value || {}
    const canManage = user.privileges && user.privileges.canManage
    const canCreate = (user.privileges && user.privileges.canCreate) ||
                      (config.multiForum && !config.restrictForumCreation)

    let info
    let section

    if (this.state.isSearching) {
      section = (<span />)
    } else {
      section = (
        <div className='forum-card-container'>
          <section />
        </div>
      )
    }

    return (
      <div id='home' className='center-container'>
        {info}
        {section}
        <List />
      </div>
    )
  }
}

export default userConnector(Home)
