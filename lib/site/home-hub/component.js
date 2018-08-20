import React, { Component } from 'react'
import { Link } from 'react-router'
import { Carousel } from 'react-bootstrap'
import t from 't-component'
import debug from 'debug'
import request from 'lib/request/request.js'
import sort from 'lib/sorts/forum'
import config from 'lib/config'
import urlBuilder from 'lib/url-builder'
import userConnector from 'lib/site/connectors/user'
import forumStore from '../../stores/forum-store/forum-store'
import ForumCard from '../home-multiforum/forum-card/component'
import SearchResults from '../home-multiforum/search-results/component'
import SearchBar from '../home-multiforum/search-bar/component'
import Footer from './footer/footer'
import SearchBarGroups from './search-bar/component'

const log = debug('democracyos:home-multiforum')

class HubHome extends Component {
  constructor (props) {
    super(props)

    this.state = {
      groups: [],
      searchInput: '',
      forums: [],
      userHasForums: false,
      page: 0,
      loading: false,
      loadingUserForms: false,
      noMore: null,
      isLoadingSearch: false,
      isSearching: false,
      searchResults: [],
      searchPage: 1,
      noMoreResults: false,
      query: null,
      isLoadingLoadMoreSearch: false,
      loaded: false
    }
  }

  componentWillMount () {
      // Get all groups
    request
      .get('/api/group/all')
      .end((err, res) => {
        if (err || !res.ok) {
          this.handleError([err || res.text])
        }
        let lastGroups = res.body.reverse().slice(0, 4)
        this.setState({ groups: lastGroups })
      })
    // Get all forums
    this.setState({ loading: true })

    forumStore.findAll({
      'privileges.canView': true,
      page: this.state.page
    }).then((forums) => {
      this.setState({
        loading: false,
        noMore: forums.length === 0,
        forums: sort(this.state.forums.concat(forums), config.sorts.multi.default),
        page: this.state.page + 1
      })
    }).catch((err) => {
      log('Forum home fetch error: ', err)
      this.setState({
        loading: false,
        noMore: true
      })
    })

    // Get user forums for permissions checking
    this.getUserForums()
  }

  componentWillUnmount () {
    forumStore.clear()
  }
  handleChange = (name) => (event) => {
    this.setState({
      [name]: event.target.value
    })
  }

  handleLoadMore = () => {
    if (this.state.loading) return
    this.setState({ loading: true })
    forumStore.findAll({
      'privileges.canView': true,
      page: this.state.page
    }).then((forums) => {
      let nextState = {
        loading: false,
        page: this.state.page + 1
      }
      if (forums.length === 0) {
        nextState.noMore = true
      } else {
        nextState.forums = this.state.forums.concat(forums)
      }
      this.setState(nextState)
    }).catch((err) => {
      log('Found error %s', err)
      this.setState({ loading: false, noMore: true })
    })
  }
  handleLoadMoreGroups = () => {
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
          let lastGroups = res.body.reverse().slice(0, 4)
          this.setState({ groups: lastGroups, loaded: false })
        })
    }
  }

  handleLoadMoreSearch = () => {
    this.setState({ isLoadingLoadMoreSearch: true })

    forumStore.search(this.state.query, this.state.searchPage)
    .then((res) => res.results.forums)
    .then((searchResults) => {
      const nextState = {
        isLoadingLoadMoreSearch: false,
        searchPage: this.state.searchPage + 1
      }

      if (searchResults.length === 0) {
        nextState.noMoreResults = true
      } else {
        nextState.searchResults = this.state.searchResults.concat(searchResults)
      }

      this.setState(nextState)
    })
    .catch((err) => {
      this.setState({
        isLoadingLoadMoreSearch: false,
        noMoreResults: true
      })

      log('Found error %s', err)
    })
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

  isSearchingGroup = (text) => {
    if (text === '') {
      request
          .get('/api/group/all')
          .end((err, res) => {
            if (err || !res.ok) {
              this.handleError([err || res.text])
            }
            let lastGroups = res.body.reverse().slice(0, 4)
            this.setState({ groups: lastGroups })
          })
    } else {
      request
        .get('/api/group/getByName/:name'.replace(':name', text))
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
    }
  }
  isSearchingForum = (text) => {
    clearInterval(this.timer)
    this.timer = setTimeout(this.search.bind(this, text), 500)
    if (text.length === 0) {
      this.setState({ isSearching: false })
    }
  }

  search = (name) => {
    this.setState({ isSearching: true, isLoadingSearch: true })
    forumStore.findOneByName(name)
        .then((forum) => {
          if (forum) {
            let forums = []
            forums.push(forum)
            this.setState({ forums: forums, isLoadingSearch: false, isSearching: false })
          }
        })
        .catch((err) => {
          log('Found Error %s', err)
          this.setState({ isSearching: true, isLoadingSearch: false })
        })
    this.setState({ isLoadingSearch: false })
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
    if (this.state.isSearching) {
      section = (
        <SearchResults isLoading={this.state.isLoadingLoadMoreSearch} noMoreResults={this.state.noMoreResults} forums={this.state.searchResults} handleLoadMoreSearch={this.handleLoadMoreSearch} />
      )
    } else {
      let interval = 2500
      section = (
        <Carousel interval={interval}>{
            this.state.forums.map((forum, key) => {
              if (forum.publishedAt && !this.state.isSearching) {
                return (
                  <Carousel.Item key={key}>
                    <ForumCard forum={forum} />
                  </Carousel.Item>
                )
              }
            })
     }
        </Carousel>
      )
    }
    let groups = this.state.groups.map((group) =>
      <div key={group.id} className='list-group'>
        <img className='logoImage' src={group.logoUrl} />
        <h4 className='group-link'><a href={urlBuilder.for('system.groups.view', { id: group.id })}>{group.name}</a></h4>
      </div>
  )

    return (
      <div className='hub-container'>
        {info}
        <div id='forum-list'>
          <div className='title'>
            <h1>{t('hub.header.title')}</h1>
          </div>
          <div id='hub-description' className='hub-description'>
            <p>
          Hinc ille commotus ut iniusta perferens et indigna praefecti custodiam protectoribus mandaverat fidis. quo conperto Montius tunc quaestor acer quidem sed ad lenitatem propensior, consulens in commune advocatos palatinarum primos scholarum adlocutus est mollius docens nec decere haec fieri nec prodesse addensque vocis obiurgatorio sonu quod si id placeret, post statuas Constantii deiectas super adimenda vita praefecto conveniet securius cogitari.

Hae duae provinciae bello quondam piratico catervis mixtae praedonum a Servilio pro consule missae sub iugum factae sunt vectigales. et hae quidem regiones velut in prominenti terrarum lingua positae ob orbe eoo monte Amano disparantur.
          </p>
            <a href={urlBuilder.for('system.hub.info')}>
              <button className='hub-info-button btn btn-success'>
                {t('hub.button.info')}
              </button>
            </a>
          </div>
          <div className='hub-roles'>
            <div className='hub-forums-view'>
              <h3>{t('hub.forums.title')}</h3>
              <a href='#hub-forums'>
                <button className='hub-forums-button btn btn-success'>
                  {t('hub.forums.button.title')}
                </button>
              </a>
            </div>
            <div className='hub-groups-view'>
              <h3>{t('hub.associations.title')}</h3>
              <a href={urlBuilder.for('system.groups.create')}>
                <button className='hub-associations-button btn btn-success'>
                  {t('hub.associations.button.title')}
                </button>
              </a>
            </div>
          </div>
          <div className='hub-associations'>
            <h2>{t('hub.active.associations.title')}</h2>
            <form method='post' autoComplete='off'>
              <div className='searchgroup'>
                <SearchBarGroups isLoading={this.state.isLoadingSearch} isSearching={this.isSearchingGroup} />
              </div>
            </form>
            <div className='list-groups'>
              {groups}
              {!this.state.noMore && (
                <div className='more-load'>
                  {!this.state.loading && (
                  <button
                    onClick={this.handleLoadMoreGroups}
                    className='btn btn-block'>
                    {!this.state.loaded && (
                    t('newsfeed.button.load-more')
                    )}
                      {this.state.loaded && (
                    t('go.back.button')
                    )}
                  </button>
              )}
                  {this.state.loading && (
                  <button
                    className='loader-btn btn btn-block'>
                    <div className='loader' />
                    {t('newsfeed.button.load-more')}
                  </button>
              )}
                </div>
          )}
            </div>
          </div>
          <div className='hub-forums' id='hub-forums'>
            <h2>{t('hub.last.consultations.title')}</h2>
            {section}
            <SearchBar isLoading={this.state.isLoadingSearch} isSearching={this.isSearchingForum} />
          </div>
        </div>
        <Footer />
      </div>
    )
  }
}

export default userConnector(HubHome)
