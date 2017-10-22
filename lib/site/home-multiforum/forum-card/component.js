import React, { Component } from 'react'
import { Link } from 'react-router'
import Geopattern from 'geopattern'

export default class ForumCard extends Component {
  render () {
    let backgroundImage = this.props.forum.coverUrl ? `url(${this.props.forum.coverUrl})` : Geopattern.generate(this.props.forum.id).toDataUrl()

    return (
      <Link to={this.props.forum.url}>
        <div
          className='forum-card'
          style={{
            backgroundImage: backgroundImage
          }}>
          <div className='author'>
            <span>{this.props.forum.owner.displayName}</span>
            <img
              src={this.props.forum.owner.avatar}
              className='avatar' />
          </div>
          <h1>{this.props.forum.title}</h1>
          <p className='desc'>
            {this.props.forum.summary}
          </p>
        </div>
      </Link>
    )
  }
}
