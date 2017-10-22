import '../polyfills/polyfills'
import React from 'react'
import { render } from 'react-dom'
import { Router, browserHistory } from 'react-router'
import ReactPiwik from 'react-piwik'
import config from 'lib/config'

/*
 * Setup Moment.js
 */

import 'lib/boot/moment'

import 'lib/analytics/analytics'
import 'lib/translations/translations'

/*
 * Register routes aliases
 */

import 'lib/boot/routes'

/*
 * Import Site Router
 */

import router from './router'

const piwik = (config.piwik.url && config.piwik.id) ? new ReactPiwik({
  url: config.piwik.url,
  siteId: config.piwik.id,
  trackErrors: true
}) : false

/*
 * Compose react app
 */

render(

  <Router history={piwik ? piwik.connectToHistory(browserHistory) : browserHistory} onUpdate={track} routes={router} />,
  document.getElementById('root')
)

function track () {
  if (window.analytics) window.analytics.page(window.location.pathname)
  if (window.ga) window.ga('send', 'pageview', window.location.pathname)
}
