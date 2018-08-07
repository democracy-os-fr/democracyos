import React, { Component } from 'react'
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
        <h4 className='list-group-item-heading'>{group.name}</h4>
        <div className='Groupactions'>
          <a href={urlBuilder.for('system.groups.update', { id: group.id })} >
            <i className='fa fa-lg fa-wrench' /></a>
          <button className='deleteButton' onClick={() => this.deleteGroup(group.id)}>
            <i className='fa fa-lg fa-trash text-danger' />
          </button>
        </div>
      </div>
    )
    console.log(this.state.groups)
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
              className='searchInput'
              maxLength='50'
              autoFocus
              value={this.state.searchInput}
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
