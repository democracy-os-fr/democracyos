import React, { Component } from 'react'
import { withRouter } from 'react-router'
import { Tabs, Tab } from 'react-bootstrap'
import t from 't-component'
import request from 'lib/request/request.js'
import urlBuilder from 'lib/url-builder'
import userConnector from 'lib/site/connectors/user'
import ForumCard from 'lib/site/home-multiforum/forum-card/component'

class GroupView extends Component {
  constructor (props) {
    super(props)
    this.state = {
      id: null,
      group: {
        name: '',
        description: '',
        logoUrl: '',
        justificatoryUrl: '',
        users: []
      },
      finalUsersIds: [],
      publicForums: [],
      privateForums: [],
      loading: true
    }
  }
  componentDidMount () {
    const { id } = this.props.params
    request
    .get('/api/group/:id'.replace(':id', id))
    .end((err, res) => {
      if (err || !res.ok) {
        this.handleError([err || res.text])
      }
      let finalIds = [...this.state.finalUsersIds]
      res.body.users.map((user) => {
        finalIds.push(user.id)
      })
      let currentGroup = {
        id: res.body.id,
        name: res.body.name,
        description: res.body.description,
        logoUrl: res.body.logoUrl,
        justificatoryUrl: res.body.justificatoryUrl,
        users: res.body.users
      }
      this.setState({
        group: currentGroup,
        finalUsersIds: finalIds })
    })
    request
    .get('/api/forums/getByGroup/:groupId'.replace(':groupId', id))
    .end((err, res) => {
      if (err || !res.ok) {
        this.handleError([err || res.text])
      }
      let privateForums = []
      let publicForums = []
      res.body.map((forum) => {
        forum.url = urlBuilder.for('site.forum', { forum: forum.name })
        if ((forum.visibility === 'private') || (forum.visibility === 'closed')) {
          privateForums.push(forum)
          this.setState({
            privateForums: privateForums,
            loading: false })
        } else {
          publicForums.push(forum)
          this.setState({
            publicForums: publicForums,
            loading: false })
        }
      })
    })
  }
  handleChange = (name) => (event) => {
    this.setState({
      [name]: event.target.value
    })
  }
  render () {
    const { group, publicForums, privateForums } = this.state

    const user = this.props.user.state.value || {}
    const canManage = user.privileges && user.privileges.canManage

    const hasUsers = group.users && (group.users.length > 0)
    const hasForums = publicForums && (publicForums.length > 0)
    const hasPrivateForums = privateForums && (privateForums.length > 0)

    let tabEventKey = 1

    return (
      <article className='container'>
        <section className='media cover'>
          <div className='media-left'>
            <img className='media-object' src={group.logoUrl} />
          </div>
          <div className='media-body'>
            <h1 className='media-heading'>
              {group.name}
              {(canManage) && (
                <a href={urlBuilder.for('system.groups.update', { id: group.id })} className='admin'>
                  <i className='fa fa-fw fa-wrench' />
                </a>
              )}
            </h1>
            <div className='group-infos'>
              <p className='group-description'> {group.description} </p>
            </div>
          </div>
        </section>

        <Tabs defaultActiveKey={1} bsStyle='pills' justified id='group-tabs' className='navigation'>
          {hasUsers && (
            <Tab eventKey={tabEventKey++} title={t('group.list.users.title')}>
              <section className='users'>
                <div className='list'>
                  {this.state.group.users.map((user) => (
                    <div key={user.id} className='displayedUsers'>
                      <img src={user.avatar} />
                      <p> {user.displayName} </p>
                    </div>
                  ))}
                </div>
              </section>
            </Tab>
          )}
          {hasForums && (
            <Tab eventKey={tabEventKey++} title={t('group.list.forums.public.title')}>
              <section className='forums forum-card-container'>
                {this.state.publicForums.map((forum, key) => {
                  if (forum.publishedAt) {
                    return (
                      <div key={key}>
                        <ForumCard forum={forum} />
                      </div>
                    )
                  }
                })}
                {this.state.publicForums.length === 0 && !this.state.loading && (
                  <p className='msg-empty'>
                    {t('newsfeed.nothing-to-show')}
                  </p>
                )}
              </section>
            </Tab>
          )}
          {hasPrivateForums && (
            <Tab eventKey={tabEventKey++} title={t('group.list.forums.private.title')}>
              <section className='forums forum-card-container'>
                {this.state.privateForums.map((forum, key) => {
                  if (forum.publishedAt) {
                    return (
                      <div key={key}>
                        <ForumCard forum={forum} />
                      </div>
                    )
                  }
                })}
                {this.state.privateForums.length === 0 && !this.state.loading && (
                  <p className='msg-empty'>
                    {t('newsfeed.nothing-to-show')}
                  </p>
                )}
              </section>
            </Tab>
          )}
        </Tabs>
      </article>
    )
  }
}

export default withRouter(userConnector(GroupView))
