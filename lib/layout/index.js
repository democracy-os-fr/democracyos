/**
 * Module dependencies.
 */

var config = require('lib/config');
var clientConfig = require('lib/config/client');
var translations = require('lib/translations');
var path = require('path');
var resolve = path.resolve;
var html = resolve(__dirname, 'index.jade');
var map = require('mout/object/map');
var replace = require('mout/string/replace');

module.exports = function (req, res) {
  var locale = req.locale;

  res.render(html, {
    config: config,
    client: clientConfig,
    locale: locale,
    translations: map(translations[locale], function(v) { return replace(v, ['{', '}'], ''); })
  });
};
