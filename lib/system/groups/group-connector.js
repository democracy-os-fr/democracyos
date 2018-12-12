import bus from 'bus'
import React, { Component } from 'react'
import { browserHistory } from 'react-router'
import isEmpty from 'mout/lang/isEmpty'
import contains from 'mout/string/contains'
import groupStore from 'lib/stores/group-store/group-store'

export default function GroupConnectorFactory (WrappedComponent) {
  return class GroupConnector extends Component {
    static displayName = `GroupConnector(${getDisplayName(WrappedComponent)})`

    static WrappedComponent = WrappedComponent

    state = {
      group: null,
      loaded: false,
      redirected: false
    }

    constructor (props) {
      super(props)

      if (contains(props.params.section, 'group') && isEmpty(props.params.id)) {
        throw new Error('GroupConnector intented to be used on Group View')
      }
    }

    componentWillReceiveProps (nextProps) {
      const { id } = nextProps.params
      this.fetchGroup(id)
    }

    componentDidMount () {
      const { id } = this.props.params
      bus.on(`group-store:update:${id}`, this.handleGroupUpdate)
      bus.on(`group-store:remove:${id}`, this.handleGroupRemove)
      this.fetchGroup(id)
    }

    componentWillUnmount () {
      const id = this.props.params.id
      bus.off(`group-store:update:${id}`, this.handleGroupUpdate)
      bus.off(`group-store:remove:${id}`, this.handleGroupRemove)
    }

    handleGroupUpdate = (group) => {
      this.setState({ group, redirected: false })
    }

    handleGroupRemove = () => {
      this.setState({ group: null })
      // this.fetchGroup(this.props.params.id)
    }

    fetchGroup = (id) => {
      groupStore.findOne(id)
        .then(this.handleGroupUpdate)
        .catch((err) => {
          if (!this.state.redirected) {
            this.setState({ redirected: true })
            if (err.status === 404) return browserHistory.push('/404')
            if (err.status === 403) return browserHistory.push(`/signin?ref=${window.location.pathname + window.location.hash}`)
            if (err.status === 401) return browserHistory.push(`/signin?ref=${window.location.pathname + window.location.hash}`)
          }
        })
    }

    render () {
      return <WrappedComponent group={this.state.group} {...this.props} />
    }
  }
}

function getDisplayName (WrappedComponent) {
  return WrappedComponent.displayName ||
    WrappedComponent.name ||
    'Component'
}
