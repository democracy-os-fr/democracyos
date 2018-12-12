import React, { Component } from 'react'
import { Alert, Form, FormGroup, FormControl, Col, InputGroup, HelpBlock, Button, ListGroup, ListGroupItem, Media } from 'react-bootstrap'
import { connect } from 'react-refetch'
import t from 't-component'
import isEmpty from 'mout/lang/isEmpty'
import guid from 'mout/random/guid'
import Icon from 'lib/common/icon'

class GroupUsersFormControl extends Component {
  constructor (props) {
    super(props)
    this.inputField = { value: '' }
    this.state = {
      controlId: isEmpty(props.controlId) ? guid() : props.controlId
    }
  }

  componentWillReceiveProps (props) {
    this.state = {
      controlId: isEmpty(props.controlId) ? guid() : props.controlId
    }
  }

  handleInputChange = (e) => {
    this.props.doSearch({
      q: e.target.value
    })
  }

  handleSelect = (user) => (e) => {
    e.persist()
    e.value = user
    this.inputField.value = ''
    this.props.handleChange(e)
    this.forceUpdate()
  }

  render () {
    // const { handleChange } = this.props
    const { controlId } = this.state
    const { search } = this.props

    const isSearching = !isEmpty(this.inputField.value) && search && search.fulfilled
    const classes = ['users-form-control']
    if (isSearching) classes.push(' searching')

    return (
      <div className={classes.join(' ')}>
        <InputGroup>
          <InputGroup.Addon>
            <Icon fixedWidth keyName='fa fa-user-plus' />
          </InputGroup.Addon>
          <input
            type='text' id={`${controlId}-text`}
            className='form-control'
            placeholder={t('common.users.placeholder')}
            ref={(ref) => { this.inputField = ref }}
            onChange={this.handleInputChange} />
        </InputGroup>
        {search && search.rejected && search.reason.cause && (
          <Alert bsStyle='danger'>
            {search.reason.cause.status} - {search.reason.cause.error.code} - {search.reason.cause.error.message}
          </Alert>
        )}
        {isSearching && (
          <ListGroup className='search-results'>
            {search.value.users.map((user) =>
              <ListGroupItem key={user.id} onClick={this.handleSelect(user)}>
                <Media>
                  <Media.Left align='middle'>
                    <img src={user.avatar} />
                  </Media.Left>
                  <Media.Body className='media-middle'>
                    <b>{user.displayName}</b>
                  </Media.Body>
                </Media>
              </ListGroupItem>
            )}
            {isEmpty(search.value.users) && (
              <ListGroupItem className='empty'>{t('validators.not.match')}</ListGroupItem>
            )}
          </ListGroup>
        )}
      </div>
    )
  }
}

export default connect((props) => {
  return {
    doSearch: (data) => ({
      search: {
        url: '/api/v2/search/users',
        method: 'POST',
        force: true,
        body: JSON.stringify(data)
      }
    })
  }
})(GroupUsersFormControl)
