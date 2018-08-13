import React, { Component } from 'react'
import t from 't-component'
import request from 'lib/request/request.js'
import ForumCard from '../../site/home-multiforum/forum-card/component'
class GroupView extends Component {
  constructor () {
    super()
    this.state = {
      id: '',
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
    const pathName = window.location.pathname
    let id = pathName.substring(20, pathName.length)
    this.setState({ id: id })
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
    const { group } = this.state
    let publicForums =
    (
      <div className='forum-card-container'>
        <section>
          {
              this.state.publicForums.map((forum, key) => {
                if (forum.publishedAt) {
                  return (
                    <div key={key}>
                      <ForumCard forum={forum} />
                    </div>
                  )
                }
              })
            }
          {
              this.state.publicForums.length === 0 &&
              !this.state.loading &&
              (
                <p className='msg-empty'>
                  {t('newsfeed.nothing-to-show')}
                </p>
              )
            }
        </section>
      </div>
        )
    let privateForums =
    (
      <div className='forum-card-container'>
        <section>
          {
              this.state.privateForums.map((forum, key) => {
                if (forum.publishedAt) {
                  return (
                    <div key={key}>
                      <ForumCard forum={forum} />
                    </div>
                  )
                }
              })
            }
          {
              this.state.privateForums.length === 0 &&
              !this.state.loading &&
              (
                <p className='msg-empty'>
                  {t('newsfeed.nothing-to-show')}
                </p>
              )
            }
        </section>
      </div>
        )
    let title = <p className='group-users-title'>{t('group.list.users.title')} </p>
    let savedUsers = this.state.group.users.map((user) =>
      <div key={user.id} className='displayedUsers'>
        <img src={user.avatar} />
        <p> {user.displayName} </p>
      </div>
  )
    return (
      <div>
        <div className='group-top'>
          <h2 className='group-title'>{group.name}</h2>
        </div>
        <div className='group-infos'>
          <img className='group-image' src={group.logoUrl} />
          <p className='group-description'> {group.description} </p>
        </div>
        <div className='group-users'>
          {title}
          {savedUsers}
        </div>
        <div className='forums'>
          <h4 style={{ textAlign: 'center' }}>{t('group.list.forums.public.title')} </h4>
          {publicForums}
          <h4 style={{ textAlign: 'center' }}>{t('group.list.forums.private.title')} </h4>
          {privateForums}
        </div>
      </div>
    )
  }
}
export default GroupView
