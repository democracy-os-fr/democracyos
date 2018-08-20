import React, { Component } from 'react'
import t from 't-component'
import { Link } from 'react-router'
import { OverlayTrigger, Popover } from 'react-bootstrap'
import Geopattern from 'geopattern'
import fa from 'lib/icon/font-awesome'
import request from 'lib/request/request.js'
import config from 'lib/config'

export default class ForumCard extends Component {
  constructor (props) {
    super(props)

    this.state = {
      stats: {
        details: {},
        topics: {},
        comments: {},
        votes: {},
        users: {}
      },
      loading: true
    }
  }

  componentWillMount () {
    this.setState({ loading: true })
    this.displayStats()
  }

  displayStats = () => {
    request
    .get('/api/stats/forum/' + this.props.forum.name)
    .end((err, res) => {
      if (err || !res.ok) {
        this.handleError([err || res.text])
      }
      this.setState({
        stats: res.body,
        loading: false
      })
    })
  }

  handleError = (err) => {
    console.error(err)
  }

  render () {
    let backgroundImage = this.props.forum.coverUrl ? (
      [
        'linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.95))',
        `url("${this.props.forum.coverUrl}")`
      ].join(', ')
    ) : Geopattern.generate(this.props.forum.id).toDataUrl()

    // fa('common.sorts.score', true, 'right')

    let popoverHoverFocus = (
      <Popover id='popover-trigger-hover-focus' title={t(`admin-permissions.visibility.${this.props.forum.visibility}.title`)}>
        <p>{t(`admin-permissions.visibility.${this.props.forum.visibility}.description`)}</p>
      </Popover>
    )

    let loading = (<i className='fa fa-spinner fa-spin fa-fw' />)

    let topics = this.state.loading ? loading : (
      <div>
        <span dangerouslySetInnerHTML={{ __html: fa('common.topic', false) }} />
        &nbsp;
        {`${this.state.stats.topics.open || 0} ${t('sidebar.open')}`}
        <small>{`  /  ${this.state.stats.topics.closed || 0} ${t('sidebar.closed')}`}</small>
      </div>
    )
    let participants = this.state.loading ? loading : (
      <div>
        <span dangerouslySetInnerHTML={{ __html: fa('common.users', false) }} />
        &nbsp;
        {this.state.stats.users.active}
      </div>
    )

    return (
      <Link to={this.props.forum.url}>
        <div
          className='forum-card'
          style={{
            backgroundImage: backgroundImage,
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat'
          }}>
          {/* <div className='author'>
            <span>{this.props.forum.owner.displayName}</span>
            <img
              src={this.props.forum.owner.avatar}
              className='avatar' />
          </div> */}
          <header>
            <h1>{this.props.forum.title}</h1>
            <p className='desc'>
              {this.props.forum.summary}
            </p>
          </header>
          <div className='info-bar'>
            <table>
              <thead>
                <tr>
                  <th className='info-visibility'>
                    <OverlayTrigger trigger={['hover', 'focus']} placement='right' overlay={popoverHoverFocus}>
                      <span dangerouslySetInnerHTML={{ __html: fa(`admin-permissions.visibility.${this.props.forum.visibility}.title`, false) }} />
                    </OverlayTrigger>
                  </th>
                  <th className='info-topics'>{topics}</th>
                  <th className='info-participants'>{participants}</th>
                </tr>
              </thead>
            </table>
          </div>
        </div>
      </Link>
    )
  }
}
