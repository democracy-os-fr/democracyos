import React, { Component } from 'react'
import t from 't-component'
import request from 'lib/request/request.js'
import urlBuilder from 'lib/url-builder'

export default class Groups extends Component {
  constructor () {
    super()
    this.state = {
      groups: [],
      searchInput: ''
    }
  }
  componentDidMount () {
    request
      .get('/api/group/all')
      .end((err, res) => {
        if (err || !res.ok) {
          this.handleError([err || res.text])
        }
        this.setState({ groups: res.body })
      })
  }
  handleChange = (name) => (event) => {
    this.setState({
      [name]: event.target.value
    })
    if (event.target.value) {
      request
      .get('/api/group/getByName/:name'.replace(':name', event.target.value))
      .end((err, res) => {
        if (err || !res.ok) {
          console.log(err)
          this.handleError([err || res.text])
        }
        if (res.body != null) {
          let grps = []
          grps[0] = res.body
          this.setState({ groups: grps })
        }
      })
    } else {
      request
      .get('/api/group/all')
      .end((err, res) => {
        if (err || !res.ok) {
          this.handleError([err || res.text])
        }
        this.setState({ groups: res.body })
      })
    }
  }
  deleteGroup = (id) => {
    request
    .delete('/api/group/:id'.replace(':id', id))
    .end(function (err, res) {
      if (err || !res.ok) {
        this.errors([err || res.text])
      }
      window.location.reload()
    })
  }
  render () {
    let groups = this.state.groups.map((group) =>
      <div key={group.id} className='list-group-item clearfix'>
        <h4><a href={urlBuilder.for('system.groups.view', { id: group.id })}>{group.name}</a></h4>
        <img className='logoImage' src={group.logoUrl} />
        <div className='Groupactions'>
          <a href={urlBuilder.for('system.groups.update', { id: group.id })} >
            <i className='fa fa-lg fa-wrench' /></a>
          <button className='deleteButton' onClick={() => this.deleteGroup(group.id)}>
            <i className='fa fa-lg fa-trash text-danger' />
          </button>
        </div>
      </div>
    )
    return (
      <div className='list list-group'>
        <form method='post' autoComplete='off'>
          <div className='searchgroup'>
            <span className='input-addon'>
              <i className='glyphicon glyphicon-search' />
            </span>
            <input type='text'
              name='searchInput'
              id='searchInput'
              className='form-control'
              placeholder={t('group.list.search.placeholder')}
              maxLength='50'
              autoFocus
              value={this.state.searchInput}
              onBlur={this.onBlur}
              onChange={this.handleChange('searchInput')} />

            <div className='addgroup'>
              <a href={urlBuilder.for('system.groups.create')} className='addButton'>
                <i className='glyphicon glyphicon-plus' /> </a>
            </div>
          </div>
        </form>
        {groups}
      </div>
    )
  }
  }
