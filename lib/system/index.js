const express = require('express')
// const config = require('lib/config')
const visibility = require('lib/visibility')
const urlBuilder = require('lib/url-builder')

const app = module.exports = express()

const action = require('lib/system/layout')

app.get(urlBuilder.for('system'), visibility, action)
app.get(urlBuilder.for('system.forums'), visibility, action)
app.get(urlBuilder.for('system.forums.create'), visibility, action)
app.get(urlBuilder.for('system.forums.copy'), visibility, action)
app.get(urlBuilder.for('system.tags'), visibility, action)
app.get(urlBuilder.for('system.tags.create'), visibility, action)
app.get(urlBuilder.for('system.tags.id'), visibility, action)
app.get(urlBuilder.for('system.users'), visibility, action)
app.get(urlBuilder.for('system.user-badges'), visibility, action)
app.get(urlBuilder.for('system.upload'), visibility, action)
