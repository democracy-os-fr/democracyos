/* eslint no-unused-vars: "off" */

var log = require('debug')('democracyos:generator')
var pick = require('mout/array/pick')
var config = require('lib/config')

const words = require('./words.json')
const icons = require('./icons.json')
const palette = require('./palette.json')

var has = Object.prototype.hasOwnProperty

exports.words = (n) => {
  var list = words.slice(0)
  if (n === 1) {
    return pick(list)
  } else if (n) {
    return pick(list, n)
  }
}

exports.icons = (n) => {
  var list = icons.slice(0)
  if (n === 1) {
    return pick(list)
  } else if (n) {
    return pick(list, n)
  }
}

exports.colors = (n) => {
  var list = palette.slice(0)
  if (n === 1) {
    return pick(list)
  } else if (n) {
    return pick(list, n)
  }
}
