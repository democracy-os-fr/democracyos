var express = require('express')
var urlBuilder = require('lib/url-builder')
var visibility = require('lib/visibility')

var app = module.exports = express()

app.get(urlBuilder.for('site.help'), visibility, require('lib/site/layout'))
app.get(urlBuilder.for('site.help.article'), visibility, require('lib/site/layout'))
app.get(urlBuilder.for('site.hub.faq'), visibility, require('lib/site/layout'))
app.get(urlBuilder.for('site.hub.info'), visibility, require('lib/site/layout'))
app.get(urlBuilder.for('site.hub.particular.help'), visibility, require('lib/site/layout'))
app.get(urlBuilder.for('site.hub.group.help'), visibility, require('lib/site/layout'))
