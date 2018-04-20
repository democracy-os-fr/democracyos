import React, { Component } from 'react'
import bus from 'bus'
import sort from 'lib/sorts/topic'
import config from 'lib/config'
import Filter from './filter/component'
import List from './list/component'

const sorts = {
  'closing-soon': {
    name: 'closing-soon',
    label: 'common.sorts.closing-soon'
  },
  'newest-first': {
    name: 'newest-first',
    label: 'common.sorts.newest-first'
  },
  'oldest-first': {
    name: 'oldest-first',
    label: 'common.sorts.oldest-first'
  },
  'recently-updated': {
    name: 'recently-updated',
    label: 'common.sorts.recently-updated'
  },
  'by-title-asc': {
    name: 'by-title-asc',
    label: 'common.sorts.by-title-asc'
  }
}

if (config.sorts.sidebar.random) {
  sorts.random = {
    name: 'random',
    label: 'common.sorts.random'
  }
}

export default class Sidebar extends Component {
  constructor (props) {
    super(props)

    this.state = {
      topics: null,
      filterOpenCount: 0,
      filterClosedCount: 0,
      filterOpenCloseToggle: true,
      filterHideVoted: false,
      filterCurrentSort: config.sorts.sidebar.default,
      showSidebar: false
    }
  }

  componentWillMount () {
    bus.on('sidebar:show', this.toggleSidebar)
    bus.emit('sidebar:enable', true)
  }

  componentWillUnmount () {
    bus.off('sidebar:show', this.toggleSidebar)
    bus.emit('sidebar:enable', false)
  }

  componentWillReceiveProps (props) {
    if (!props.topics) return

    const count = props.topics.length
    const filterOpenCount = props.topics.filter((topic) => !topic.closed).length
    const filterClosedCount = count - filterOpenCount
    const filterOnActiveTopic = props.activeTopic && props.activeTopic.open
    const filterOpenCloseCount = filterOpenCount > 0
    const filterOpenCloseToggle = filterOnActiveTopic && filterOpenCloseCount

    this.setState({ filterOpenCount, filterClosedCount, filterOpenCloseToggle }, this.setFilter)
  }

  toggleSidebar = (bool) => {
    this.setState({ showSidebar: bool })
  }

  handleFilterStatusChange = (evt) => {
    const status = evt.currentTarget.getAttribute('data-status') === 'open'
    this.setFilter({ filterOpenCloseToggle: status })
  }

  handleFilterHideVotedChange = (evt) => {
    const hide = evt.currentTarget.checked
    this.setFilter({ filterHideVoted: hide })
  }

  handleFilterSortChange = (evt) => {
    const sort = evt.currentTarget.getAttribute('data-sort')
    this.setFilter({ filterCurrentSort: sort })
  }

  setFilter = (nextFilterState) => {
    if (!this.props.topics) return

    const state = Object.assign({}, this.state, nextFilterState)

    state.topics = sort(this.props.topics
      // Status
      .filter((topic) => state.filterOpenCloseToggle ? !topic.closed : topic.closed)
      // Hide Voted
      .filter((topic) => state.filterHideVoted ? !topic.voted : true),
      // Sort
    state.filterCurrentSort)

    this.setState(state)
  }

  render () {
    return (
      <nav id='sidebar' className={this.state.showSidebar && 'active'}>
        {
          this.props.topics !== null && (
            <Filter
              sorts={sorts}

              openCount={this.state.filterOpenCount}
              closedCount={this.state.filterClosedCount}
              openCloseToggle={this.state.filterOpenCloseToggle}
              hideVoted={this.state.filterHideVoted}
              currentSort={this.state.filterCurrentSort}

              onFilterStatusChange={this.handleFilterStatusChange}
              onFilterSortChange={this.handleFilterSortChange}
              onFilterHideVotedChange={this.handleFilterHideVotedChange} />
          )
        }
        {
          this.props.topics !== null && (
            <List
              topics={this.state.topics}
              activeTopic={this.props.activeTopic} />
          )
        }
      </nav>
    )
  }
}
