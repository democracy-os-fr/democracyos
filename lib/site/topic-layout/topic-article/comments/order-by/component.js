import React, { Component } from 'react'
import { Tabs, Tab } from 'react-bootstrap'
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
      active: '-score'
    }

    this.handleSelect = this.handleSelect.bind(this)
  }

  handleSelect (id) {
    this.props.onSort(id)

    this.setState({
      active: id
    })
  }

  onOutsideEvent () {}

  render () {
    const sorts = this.constructor.sorts
    const getSortLabel = this.constructor.getSortLabel
    const filterRandom = this.constructor.filterRandom

    return (
      <div className='comments-sort'>
        <Tabs bsStyle='pills' justified defaultActiveKey={sorts[0].id} onSelect={this.handleSelect} id='sortTabs'>
          {
            filterRandom(sorts).map((sort, i) => (
              <Tab key={sort.id} eventKey={sort.id} title={<div dangerouslySetInnerHTML={{ __html: sort.label }} />} />
            ))
          }
        </Tabs>
      </div>
    )
  }
}

export default ReactOutsideEvent(CommentsOrderBy)
