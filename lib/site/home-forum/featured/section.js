import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import t from 't-component'

export default class FeaturedSection extends Component {
  constructor (props) {
    super(props)

    this.state = {
      fetched: false,
      loading: false
    }
  }

  componentWillMount () {}

  componentWillUnmount () {}

  render () {
    let sectionClasses = ['featured']
    if (this.state.loading) {
      sectionClasses.push('loading')
    }

    return (
      <section className={sectionClasses.join(' ')}>
        {this.state.loading ? (
          <div className='loader-wrapper'>
            <div className='topic-loader' />
          </div>
        ) : (this.state.fetched && (
          <div className='featured-card'>
            COMMENTS
          </div>
        ))}
      </section>
    )
  }
}
