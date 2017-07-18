import React, { Component } from 'react'
import { Link } from 'react-router'
import t from 't-component'
import config from 'lib/config'
// import { Sidebar } from 'lib/site/help/sidebar/component'
import MarkdownGuide from 'lib/site/help/md-guide/component'

const Sidebar = () => (
  <div id='help-sidebar-container'>
    <div className='help-sidebar'>
      {Sidebar.articles.map((article, i) => (
        <Link key={i} to={article.path}>{article.label}</Link>
      ))}
    </div>
  </div>
)

Sidebar.articles = [
  config.frequentlyAskedQuestions
  ? { label: t('help.faq.title'), path: '/help/faq' }
  : false,
  { label: t('help.markdown.title'), path: '/help/markdown' },
  config.glossary
  ? { label: t('help.glossary.title'), path: '/help/glossary' }
  : false,
  config.termsOfService
  ? { label: t('help.tos.title'), path: '/help/terms-of-service' }
  : false,
  config.privacyPolicy
  ? { label: t('help.pp.title'), path: '/help/privacy-policy' }
  : false,
  config.legalTerms
  ? { label: t('help.legal.title'), path: '/help/legal' }
  : false

].filter((p) => p)

export default class HelpLayout extends Component {
  constructor (props) {
    super(props)
    this.articles = {
      'faq':
        config.frequentlyAskedQuestions ? { __html: require('./faq.md') } : false,
      'glossary':
        config.glossary ? { __html: require('./glossary.md') } : false,
      'terms-of-service':
        config.termsOfService ? { __html: require('./tos.md') } : false,
      'privacy-policy':
        config.privacyPolicy ? { __html: require('./pp.md') } : false,
      'legal':
        config.legalTerms ? { __html: require('./legal.md') } : false
    }
  }

  render () {
    return (
      <div id='help-container'>
        <Sidebar articles={this.props.route.articles} />
        {
          (
            !this.props.params.article ||
            this.props.params.article === 'markdown'
          ) &&
            <MarkdownGuide />
        }
        {
          this.props.params.article &&
          this.props.params.article !== 'markdown' &&
          this.articles[this.props.params.article] &&
          (
            <div className='article-container'>
              <div
                className='article-content'
                dangerouslySetInnerHTML={this.articles[this.props.params.article]} />
            </div>
          )
        }
      </div>
    )
  }
}
