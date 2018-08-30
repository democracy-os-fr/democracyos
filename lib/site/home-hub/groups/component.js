import React, { Component } from 'react'
import t from 't-component'
// import debug from 'debug'
import request from 'lib/request/request.js'
import urlBuilder from 'lib/url-builder'
import SearchBar from '../search-bar/component'

// const log = debug('democracyos:home-hub:groups')

class GroupsSection extends Component {
  constructor (props) {
    super(props)

    this.state = {
      groups: [],
      searchInput: '',
      loading: false,
      loadingUserForms: false,
      noMore: null,
      isLoadingSearch: false,
      isSearching: false,
      loaded: false
    }
  }

  componentWillMount () {
    this.setState({ loading: true })
    // Get all groups
    request
    .get('/api/group/all')
    .end((err, res) => {
      if (err || !res.ok) {
        this.handleError([err || res.text])
      }
      let lastGroups = res.body.reverse().slice(0, 6)
      this.setState({
        loading: false,
        groups: lastGroups
      })
    })
  }

  handleChange = (name) => (event) => {
    this.setState({
      [name]: event.target.value
    })
  }

  handleLoadMore = () => {
    if (this.state.loaded === false) {
      request
        .get('/api/group/all')
        .end((err, res) => {
          if (err || !res.ok) {
            this.handleError([err || res.text])
          }
          let groups = res.body.reverse()
          this.setState({
            groups: groups,
            loaded: true }
           )
        })
    } else {
      request
      .get('/api/group/all')
      .end((err, res) => {
        if (err || !res.ok) {
          this.handleError([err || res.text])
        }
        let lastGroups = res.body.reverse().slice(0, 6)
        this.setState({ groups: lastGroups, loaded: false })
      })
    }
  }

  isSearchingGroup = (text) => {
    if (text === '') {
      request
          .get('/api/group/all')
          .end((err, res) => {
            if (err || !res.ok) {
              this.handleError([err || res.text])
            }
            let lastGroups = res.body.reverse().slice(0, 6)
            this.setState({ groups: lastGroups })
          })
    } else {
      request
        .get('/api/group/search/:name'.replace(':name', text))
        .end((err, res) => {
          if (err || !res.ok) {
            console.log(err)
            this.handleError([err || res.text])
          }
          if (res.body != null) {
            let grps = []
            grps = res.body
            this.setState({ groups: grps })
          }
        })
    }
  }

  render () {
    if (this.state.loadingUserForms) return null
    if (this.props.user.state.pending) return null

    return (
      <div className='hub-associations'>
        <h2>{t('hub.active.associations.title')}</h2>
        <div className='searchgroup'>
          <SearchBar
            isLoading={this.state.isLoadingSearch}
            isSearching={this.isSearchingGroup}
            placeholder={t('group.list.search.placeholder')} />
        </div>
        <div className='list-groups'>
          {this.state.groups.map((group) =>
            <div key={group.id} className='list-group'>
              <a href={urlBuilder.for('system.groups.view', { id: group.id })}>
                <img className='logoImage' src={group.logoUrl} />
                <h4 className='group-link'>{group.name}</h4>
              </a>
            </div>
          )}
          {!this.state.noMore && (
            <div className='more-load'>
              {!this.state.loading && (
                <button onClick={this.handleLoadMore} className='btn btn-block'>
                  {!this.state.loaded && (
                    t('newsfeed.button.load-more')
                  )}
                  {this.state.loaded && (
                    t('go.back.button')
                  )}
                </button>
              )}
              {this.state.loading && (
                <button className='loader-btn btn btn-block'>
                  <div className='loader' />
                  {t('newsfeed.button.load-more')}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }
}

export default GroupsSection
