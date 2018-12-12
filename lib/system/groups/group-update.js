import React, { Component } from 'react'
import {
  utils as ReactBootstrapUtils,
  Alert, Form, FormGroup, FormControl,
  Col, ControlLabel, HelpBlock, Button,
  ListGroup, ListGroupItem, Media
} from 'react-bootstrap'
import { connect } from 'react-refetch'
import t from 't-component'
import { deepClone, isEmpty } from 'mout/lang'
import { contains, removeAll, findIndex, reject, filter } from 'mout/array'
import unset from 'mout/object/unset'
import guid from 'mout/random/guid'
import UploadFormControl from 'lib/common/uploader/control'
import { HorizontalFormGroup } from 'lib/common/form/form-group'
import utils from 'lib/common/uploader/utils'
import Icon from 'lib/common/icon'
import GroupUsersFormControl from './users/control'

ReactBootstrapUtils.bootstrapUtils.addStyle(Button, 'badge')

class GroupUpdate extends Component {
  constructor (props) {
    super(props)
    this.state = {
      errors: {},
      alerts: [],
      dismissed: []
    }
  }

  componentWillReceiveProps ({ groupFetch }) {
    if (!groupFetch.pending && !groupFetch.rejected) {
      const { group, messages } = groupFetch.value
      // console.log('GroupUsersFormControl componentWillReceiveProps')
      // console.dir(group)

      let workingGroup = deepClone(group)
      workingGroup.users = workingGroup.users.map((user) => {
        user.isAdmin = findIndex(workingGroup.owners, { id: user.id }) >= 0
        return user
      })

      this.setState({
        group: workingGroup,
        alerts: this.state.alerts.concat(messages ? messages.map((m) => ({
          type: 'success',
          value: t(m),
          uid: guid()
        })) : [])
      })
    }
  }

  componentDidMount () {
    this.recomputeSize()
  }

  componentDidUpdate () {
    this.recomputeSize()
  }

  recomputeSize = () => {
    this.descriptionField.style.minHeight = 'auto'
    this.descriptionField.style.minHeight = `${this.descriptionField.scrollHeight}px`
  }

  handleChange = (field) => (event) => {
    const payload = event.value ? event.value : event.target.value
    // console.log(`handleChange ${field} --> ${payload}`)

    let { group, errors } = this.state

    if (!isEmpty(event.errors)) {
      console.error(event.errors)
      errors[field] = event.errors
    } else {
      unset(errors, field)
    }

    group[field] = payload
    this.setState({ group, errors })
  }

  handleDescriptionField = (event) => {
    this.recomputeSize()
    this.handleChange('description')(event)
  }

  handleUserSearch = (event) => {
    const payload = event.value ? event.value : event.target.value
    console.log(`handleUsersSearch`)
    console.dir(payload)

    let { group } = this.state
    if (findIndex(group.users, { id: payload.id }) < 0) {
      payload.isAdmin = findIndex(group.owners, { id: payload.id }) >= 0
      payload.willBeRemoved = false
      payload.willBeAdded = true
      group.users = [payload].concat(group.users)
      this.setState({ group })
    }
  }

  toggleAdmin = (user) => (event) => {
    user.willBeUpdated = !user.willBeUpdated
    user.isAdmin = !user.isAdmin
    this.forceUpdate()
  }

  handleUserRemove = (user) => (event) => {
    user.willBeRemoved = true
    this.forceUpdate()
  }

  handleCancel = (user) => (event) => {
    if (user.willBeUpdated) {
      user.willBeUpdated = !user.willBeUpdated
      user.isAdmin = !user.isAdmin
    } else {
      user.willBeRemoved = false
    }
    this.forceUpdate()
  }

  handleSubmit = (e) => {
    e.preventDefault()

    const origin = this.props.groupFetch.value.group
    let { name, logoUrl } = this.state.group
    let errors = this.state.errors
    if (isEmpty(name)) {
      errors['name'] = t('validators.required')
    }

    if (isEmpty(errors)) {
      let { dismissed, group } = this.state
      group.users = reject(group.users, 'willBeRemoved')
      group.owners = filter(group.users, 'isAdmin')

      let uploads = []
      if (!isEmpty(logoUrl) && (origin.logoUrl !== logoUrl)) {
        uploads.push(this.logoField.handleUpload())
      }

      Promise.all(uploads).then((responses) => {
        if (!isEmpty(responses)) {
          responses.map((response) => {
            console.log(`${response.text} ${response.statusText}`)
          })
        }
        removeAll(dismissed, 'refecth-error')
        this.setState({ dismissed })
        this.props.handleEdit(group)
      }).catch((err) => {
        console.error(err)
        if (err.response) {
          this.setState({
            alerts: this.state.alerts.concat([{
              type: 'danger',
              value: err.response.text,
              uid: guid()
            }])
          })
        }
      })
    } else {
      this.setState({ errors })
    }
  }

  handleDismiss = (uid) => () => {
    let { dismissed } = this.state
    dismissed.push(uid)
    this.setState({ dismissed })
  }

  render () {
    const { group, errors, alerts, dismissed } = this.state
    const { groupFetch } = this.props

    return (
      <div className='group update'>

        <Form horizontal>

          <div className='group-top'>
            <h3 className='group-title'>{t('group.form.edit.title')}</h3>
          </div>

          {!isEmpty(alerts) && (
            <FormGroup>
              <Col sm={10} smOffset={1}>
                {alerts.map((alert) => {
                  return !contains(dismissed, alert.uid) &&
                    <Alert key={alert.uid} bsStyle={alert.type} onDismiss={this.handleDismiss(alert.uid)} closeLabel={t('common.close')}>
                      {alert.value}
                    </Alert>
                })}
              </Col>
            </FormGroup>
          )}

          {!groupFetch.pending && groupFetch.rejected && groupFetch.reason.cause && !contains(dismissed, 'refecth-error') && (
            <FormGroup>
              <Col sm={10} smOffset={1}>
                <Alert bsStyle='danger' onDismiss={this.handleDismiss('refecth-error')} closeLabel={t('common.close')}>
                  <h4>{t('common.internal-error')}</h4>
                  <pre>{groupFetch.reason.cause.status} - {groupFetch.reason.cause.error.code} - {groupFetch.reason.cause.error.message}</pre>
                </Alert>
              </Col>
            </FormGroup>
          )}

          <HorizontalFormGroup name='name' label='group.form.name.label' errors={errors['name']}>
            <FormControl type='text'
              onChange={this.handleChange('name')}
              value={group ? group.name : ''} />
          </HorizontalFormGroup>

          <HorizontalFormGroup name='description' label='group.form.description.label' errors={errors['description']}>
            <FormControl componentClass='textarea' rows={2}
              inputRef={(ref) => { this.descriptionField = ref }}
              onChange={this.handleDescriptionField}
              value={group ? group.description : ''} />
          </HorizontalFormGroup>

          <HorizontalFormGroup name='logoUrl' label='group.form.logoUrl.label' errors={errors['logoUrl']}>
            <UploadFormControl name='logoUrl'
              ref={(ref) => { this.logoField = ref }}
              handleChange={this.handleChange('logoUrl')}
              value={group ? group.logoUrl : ''} />
          </HorizontalFormGroup>

          <HorizontalFormGroup name='justificatoryUrl' label='forum.form.justificatory' errors={errors['justificatoryUrl']}>
            <UploadFormControl name='justificatoryUrl'
              types={['.pdf']}
              ref={(ref) => { this.justificatoryField = ref }}
              handleChange={this.handleChange('justificatoryUrl')}
              value={group ? group.justificatoryUrl : ''} />
          </HorizontalFormGroup>

          <HorizontalFormGroup name='users' label='group.form.members.label' errors={errors['users']}>
            <GroupUsersFormControl name='users'
              ref={(ref) => { this.usersField = ref }}
              handleChange={this.handleUserSearch} />
          </HorizontalFormGroup>

          {group && !isEmpty(group.users) && (
            <Col sm={10} smOffset={2}>
              <ListGroup className='users-list'>
                {group.users.map((user) =>
                  <ListGroupItem key={guid()}
                    bsStyle={((user) => {
                      if (user.willBeAdded) return 'info'
                      if (user.willBeUpdated) return 'warning'
                      return null
                    })(user)}
                    disabled={user.willBeRemoved}>
                    <Media>
                      <Media.Left align='middle'>
                        <img width={48} height={48} src={user.avatar} />
                      </Media.Left>
                      <Media.Body className='media-middle'>
                        <div className='flex-wrapper'>
                          <div className='info'>
                            <b>{user.displayName}</b>
                          </div>
                          <div className='actions'>

                            <Button bsStyle='badge' className={user.isAdmin ? 'admin' : ''} onClick={this.toggleAdmin(user)}>
                              <Icon fixedWidth keyName={`group.users.admin${user.isAdmin ? '' : '.off'}`} />
                              {t('group.users.admin')}
                            </Button>

                            {(user.willBeRemoved || user.willBeUpdated) ? (
                              <Button bsStyle='link' className='text-neutral'
                                onClick={this.handleCancel(user)}>
                                <Icon keyName='common.undo' />
                              </Button>
                            ) : (
                              <Button bsStyle='link' className='text-danger'
                                onClick={this.handleUserRemove(user)}>
                                <Icon keyName='common.remove' tooltip='group.users.remove' />
                              </Button>
                            )}
                          </div>
                        </div>
                      </Media.Body>
                    </Media>
                  </ListGroupItem>
                )}
              </ListGroup>
            </Col>
          )}

          <Col sm={10} smOffset={2}>
            <Button type='submit' bsStyle='success' onClick={this.handleSubmit} disabled={!isEmpty(errors)}>
              <i className='glyphicon glyphicon-save' />
              &emsp;
              {t('admin-tags-form.button.submit')}
            </Button>
          </Col>

        </Form>
      </div>
    )
  }
}

export default connect((props) => {
  return {
    groupFetch: `/api/v2/group/${props.params.id}`,
    handleEdit: (data) => ({
      groupFetch: {
        url: `/api/v2/groups/${data.id}`,
        method: 'PUT',
        force: true,
        body: JSON.stringify(data)
      }
    }),
    handleUpload: (data) => ({
      uploadFiles: {
        url: `/api/v2/groups/${data.id}`,
        method: 'POST',
        force: true,
        body: JSON.stringify(data)
      }
    })
  }
})(GroupUpdate)
