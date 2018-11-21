import React, { Component } from 'react'
import t from 't-component'
import debug from 'debug'
import sort from 'lib/sorts/forum'
import config from 'lib/config'
import forumStore from 'lib/stores/forum-store/forum-store'
import ForumCard from 'lib/site/home-multiforum/forum-card/component'
import SearchResults from 'lib/site/home-multiforum/search-results/component'
import SearchBar from '../search-bar/component'

const log = debug('democracyos:hub:forums')

class ForumsSection extends Component {
  constructor (props) {
    super(props)

    this.state = {
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
      isLoadingLoadMoreSearch: false
    }
  }

  componentWillMount () {
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

  isSearching = (text) => {
    clearInterval(this.timer)
    if (text.length > 2) {
      this.timer = setTimeout(this.search.bind(this, text), 500)
    }
    if (text.length === 0) {
      this.setState({ isSearching: false })
    }
  }

  search = (query) => {
    this.setState({
      isLoadingSearch: true,
      query,
      searchPage: 1,
      noMoreResults: false
    })

    forumStore.search(query, this.state.searchPage)
    .then((res) => res.results.forums)
    .then((searchResults) => {
      this.setState({ isSearching: true, searchResults, isLoadingSearch: false, searchPage: this.state.searchPage + 1 })
    })
    .catch((err) => {
      this.setState({ isSearching: true, isLoadingSearch: false })
      log('Found error %s', err)
    })
  }

  render () {
    if (this.state.loadingUserForms) return null
    if (this.props.user.state.pending) return null

    let section

    if (this.state.isSearching) {
      section = (
        <SearchResults
          isLoading={this.state.isLoadingLoadMoreSearch}
          noMoreResults={this.state.noMoreResults}
          forums={this.state.searchResults}
          handleLoadMoreSearch={this.handleLoadMoreSearch} />
      )
    } else {
      section = (
        <div className='forum-card-container'>
          <section>
            {
              this.state.forums.map((forum, key) => {
                if (forum.publishedAt) {
                  return <ForumCard forum={forum} key={key} />
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
          {!this.state.noMore && (
            <div className='load-more'>
              {!this.state.loading && (
                <button
                  onClick={this.handleLoadMore}
                  className='btn btn btn-sm btn-block'>
                  {t('newsfeed.button.load-more')}
                </button>
              )}
              {this.state.loading && (
                <button
                  className='loader-btn btn btn-sm btn-block'>
                  <div className='loader' />
                  {t('newsfeed.button.load-more')}
                </button>
              )}
            </div>
          )}
        </div>
      )
    }

    return (
      <div id='forum-list'>
        <h2>{t('hub.last.consultations.title')}</h2>
        <SearchBar
          isLoading={this.state.isLoadingSearch}
          isSearching={this.isSearching}
          placeholder={t('newsfeed.search.placeholder')} />
        {section}
      </div>
    )
  }
}

export default ForumsSection
