import React, { Component } from 'react'
import t from 't-component'
import config from 'lib/config'
import sort from 'lib/sorts/forum'
import request from 'lib/request/request.js'
import ForumCard from '../../site/home-multiforum/forum-card/component'
class GroupView extends Component {
  constructor () {
    super()
    this.state = {
      id: '',
      group: {
        name: '',
        logoUrl: '',
        justificatoryUrl: '',
        users: []
      },
      finalUsersIds: [],
      forums: [],
      loading: true,
      page: 0
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
      this.setState({
        forums: sort(this.state.forums.concat(res.body), config.sorts.multi.default),
        loading: false })
    })
  }
  handleChange = (name) => (event) => {
    this.setState({
      [name]: event.target.value
    })
  }
  render () {
    const { group } = this.state
    let forums =
    (
      <div className='forum-card-container'>
        <section>
          {
              this.state.forums.map((forum, key) => {
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
              this.state.forums.length === 0 &&
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
    let title = <p>{t('group.list.users.title')} </p>
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
        <div className='group-images'>
          <img className='group-image' src={group.logoUrl} />
        </div>
        <div className='group-users'>
          {title}
          {savedUsers}
        </div>
        <h4 style={{ textAlign: 'center' }}>{t('group.list.forums.title')} </h4>
        {forums}
      </div>
    )
  }
}
export default GroupView
