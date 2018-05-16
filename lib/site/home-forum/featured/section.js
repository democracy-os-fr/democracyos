import React, { Component } from 'react'
import { Tabs, Tab } from 'react-bootstrap'
import t from 't-component'
import userConnector from 'lib/site/connectors/user'
import FeaturedCarousel from './carousel'

export class FeaturedSection extends Component {
  constructor (props) {
    super(props)

    this.state = {
      status: 'draft'
    }
  }

  componentWillMount () {}

  componentWillUnmount () {}

  render () {
    const { forum, user } = this.props
    return (
      <section className='featured'>
        <Tabs defaultActiveKey={1} bsStyle='pills' justified id='featured-tabs'>
          <Tab eventKey={1} title={t('homepage.featured.last.title')}>
            <FeaturedCarousel type='last' forum={forum} user={user} />
          </Tab>
          <Tab eventKey={2} title={t('homepage.featured.voted.title')}>
            <FeaturedCarousel type='voted' forum={forum} user={user} />
          </Tab>
          { user && user.state.fulfilled &&
            <Tab eventKey={3} title={t('homepage.featured.help.title')}>
              <div className='description'>
                <p>{t('homepage.featured.help.description')}</p>
              </div>
              <FeaturedCarousel type='help' forum={forum} user={user} />
            </Tab>
          }
        </Tabs>
      </section>
    )
  }
}

export default userConnector(FeaturedSection)
