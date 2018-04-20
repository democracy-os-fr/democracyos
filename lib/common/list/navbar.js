import React, { Component } from 'react'
import { FormGroup, FormControl, InputGroup, DropdownButton, MenuItem } from 'react-bootstrap'
import t from 't-component'
import difference from 'mout/array/difference'
import contains from 'mout/array/contains'
import Icon from 'lib/common/icon'

export default class NavBar extends Component {
  constructor (props) {
    super(props)

    this.state = {
      search: '',
      filters: [],
      sorts: [],
      multiFilter: false,
      multiSort: false
    }
  }

  handleSearch = (e) => {
    this.props.handleInput('search', e.target.value)
    this.setState({ search: e.target.value })
  }
  handleFilter = (key) => {
    this.props.handleInput('filters', key)
    if (contains(this.state.filters, key)) {
      if (this.state.multiFilter) {
        this.setState({ filters: difference(this.state.filters, [key]) })
      } else {
        this.setState({ filters: [] })
      }
    } else {
      if (this.state.multiFilter) {
        this.setState({ filters: this.state.filters.concat([key]) })
      } else {
        this.setState({ filters: [key] })
      }
    }
  }
  handleSort = (key) => {
    this.props.handleInput('sorts', key)

    if (contains(this.state.sorts, key)) {
      if (this.state.multiSort) {
        this.setState({ sorts: difference(this.state.sorts, [key]) })
      } else {
        this.setState({ sorts: [] })
      }
    } else {
      if (this.state.multiSort) {
        this.setState({ sorts: this.state.sorts.concat([key]) })
      } else {
        this.setState({ sorts: [key] })
      }
    }
  }

  render () {
    let iconFilter = (
      <Icon keyName='common.sorts.filters' />
    )
    let iconSort = (
      <Icon keyName='common.sorts.label' />
    )

    return (
      <FormGroup>
        <InputGroup>
          <InputGroup.Addon>
            <i className='fa fa-search' />
          </InputGroup.Addon>
          <FormControl type='text'
            maxLength='100'
            onKeyUp={this.handleSearch}
            placeholder={t('newsfeed.search.placeholder')} />
          <DropdownButton
            className='btn-filter' pullRight
            componentClass={InputGroup.Button}
            id='list-navbar-btn-filter'
            title={iconFilter} noCaret>
            <MenuItem header key={Date.now()}>{t('common.sorts.filters')}</MenuItem>
            {this.props.filters.list.map((filter) => {
              if (filter.divider) {
                return (
                  <MenuItem divider key={Date.now()} />
                )
              }
              let key = filter.key + '@' + filter.value
              return (
                <MenuItem key={key}
                  eventKey={key}
                  onSelect={this.handleFilter}
                  active={contains(this.state.filters, key)}>
                  {filter.label}
                </MenuItem>
              )
            })}
          </DropdownButton>
          <DropdownButton
            className='btn-sort' pullRight
            componentClass={InputGroup.Button}
            id='list-navbar-btn-sort'
            title={iconSort} noCaret>
            <MenuItem header key={Date.now()}>{t('common.sorts.label')}</MenuItem>
            {this.props.sorts.list.map((sort) => {
              if (sort.divider) {
                return (
                  <MenuItem divider key={Date.now()} />
                )
              }
              let key = sort.key + '@' + sort.value
              return (
                <MenuItem key={key}
                  eventKey={key}
                  onSelect={this.handleSort}
                  active={contains(this.state.sorts, key)}>
                  {sort.label}
                </MenuItem>
              )
            })}
          </DropdownButton>
        </InputGroup>
      </FormGroup>
    )
  }
}
