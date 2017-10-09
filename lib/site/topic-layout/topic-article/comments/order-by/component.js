import React, { Component } from 'react'
import t from 't-component'
import ReactOutsideEvent from 'react-outside-event'
import reject from 'mout/array/reject'
import config from 'lib/config'

export class CommentsOrderBy extends Component {
  static sorts = [
    { id: '-score', label: t('common.sorts.score') },
    { id: '-createdAt', label: t('common.sorts.newest-first') },
    { id: 'createdAt', label: t('common.sorts.oldest-first') },
    { id: 'random', label: t('common.sorts.random') }
  ]

  static getSortLabel (id) {
    const sort = CommentsOrderBy.sorts.find((s) => s.id === id)
    return sort ? sort.label : null
  }

  static filterRandom (set) {
    if (config.sorts.comment.random) return set
    else return reject(set, { id: 'random' })
  }

  constructor (props) {
    super(props)

    this.state = {
      sortsVisibility: false,
      active: '-score'
    }
  }

  handleShowSorts = () => {
    this.setState({ sortsVisibility: !this.state.sortsVisibility })
  }

  handleSort = (id) => () => {
    this.props.onSort(id)

    this.setState({
      sortsVisibility: false,
      active: id
    })
  }

  onOutsideEvent = () => {
    if (!this.state.sortsVisibility) return
    this.setState({ sortsVisibility: false })
  }

  render () {
    const sorts = this.constructor.sorts
    const getSortLabel = this.constructor.getSortLabel
    const filterRandom = this.constructor.filterRandom

    return (
      <div className='comments-sort'>
        <button className='comments-sort-btn btn btn-link btn-sm' onClick={this.handleShowSorts}>
          {t('comments.ordered-by')}
          <strong>&nbsp;{getSortLabel(this.state.active)}</strong>
          <span className='caret' />
        </button>
        {
          this.state.sortsVisibility && (
            <div className='comments-dropdown'>
              {
                filterRandom(sorts).map((sort) => (
                  <button
                    type='button'
                    key={sort.id}
                    onClick={this.handleSort(sort.id)}>
                    {sort.label}
                  </button>
                ))
              }
            </div>
          )
        }
      </div>
    )
  }
}

export default ReactOutsideEvent(CommentsOrderBy)
