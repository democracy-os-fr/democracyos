import React, { Component } from 'react'
import ReactOutsideEvent from 'react-outside-event'
import reject from 'mout/array/reject'
import fa from 'lib/icon/font-awesome'
import config from 'lib/config'

export class CommentsOrderBy extends Component {
  static sorts = [
    { id: '-score', label: fa('common.sorts.score', true, 'right') },
    { id: '-createdAt', label: fa('common.sorts.newest-first', true, 'right') },
    { id: 'createdAt', label: fa('common.sorts.oldest-first', true, 'right') },
    { id: 'random', label: fa('common.sorts.random', true, 'right') }
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
          <strong dangerouslySetInnerHTML={{ __html: getSortLabel(this.state.active) }} />
          {/* <span className='caret' /> */}
        </button>
        {
          this.state.sortsVisibility && (
            <div className='comments-dropdown'>
              {
                filterRandom(sorts).map((sort) => (
                  <button
                    type='button'
                    key={sort.id}
                    onClick={this.handleSort(sort.id)}
                    dangerouslySetInnerHTML={{ __html: sort.label }} />
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
