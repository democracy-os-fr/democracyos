/**
 * Module dependencies.
 */

var express = require('express');
var api = require('lib/db-api');

var mongoose = require('mongoose');
var Comment = mongoose.model('Comment');
var Rules = mongoose.model('Rules');
var Tag = mongoose.model('Tag');
var Forum = mongoose.model('Forum');
var User = mongoose.model('User');
var config = require('lib/config');
var utils = require('lib/utils');
var restrict = utils.restrict;
var staff = utils.staff;
var log = require('debug')('democracyos:csv');
var csv = require('json-csv')
var encoding = require("encoding");

var t = require('t-component');

var arrayFilter = require('mout/array/filter');
var replace = require('mout/string/replace');
var strftime = require('mout/date/strftime');

var app = module.exports = express();

app.get('/all-comments', staff, getRules, function (req, res) {
  log('Request /csv/all-comments');

  var locale = req.user ? ( req.user.locale || config.locale ) : config.locale;

  var query = {
    context: 'topic',
    //createdAt: { $gt: new Date(1461076025199) }
  };

  Comment
  .find(query)
  .populate('author')
  .populate('topicId')
  .sort('topicId.forum reference createdAt')
  .exec(function (err, comments) {
    if (err) return _handleError(err, req, res);

    log('Found %s comments in total', comments.length);

    var filtered = filter(comments, (comment) => {
      if(!comment.topicId){
        return false;
      } else if(comment.topicId.deletedAt){
        return false;
      } else if (!comment.topicId.publishedAt){
        return false;
      }
      return true;
    });

    log('Comments filtered to %s', filtered.length);

    Forum.populate(filtered, 'topicId.forum', function(_err) {
      if (_err) return _handleError(_err, req, res);

      Tag.populate(filtered, 'topicId.tag', function(__err) {
        if (__err) return _handleError(__err, req, res);

        var options = {
          fields: [],
          fieldSeparator: config.csv.separator
        };

        options.fields.push({
          name: 'topicId.forum.title',
          label: t('admin-topics-form.label.forum'),
          quoted: true
        });

        options.fields.push({
            name: 'topicId.mediaTitle',
            label: t('common.topic'),
            quoted: true
        });
        options.fields.push({
            name: 'alias',
            label: t('comments.alias.title'),
            quoted: true
        });
        options.fields.push({
            name: 'count',
            label: t('comments.count.title'),
            quoted: true
        });

        options.fields.push({
            name: 'author.id',
            label: 'user-id',
            quoted: true
        });

        if( config.userAge ) {
          options.fields.push({
              name: 'author.age',
              label: t('settings.age'),
              quoted: true,
              filter: function(value) {
                if(value) return t('settings.age.' + value);
              }
          });
        }


        if( 0 <= config.rules.indexOf('location') ){
          options.fields.push({
              name: 'author.location',
              label: t('settings.location'),
              quoted: true,
              filter: function(value) {
                if(value){
                  var rule = arrayFilter(req.ctx.rules, {name: value});
                  if(rule.length){
                    return rule[0].value.label[locale] || rule[0].value.label.default;
                  }
                }
              }
          });
        }

        options.fields.push({
            name: 'text',
            label: t('admin-topics-form.clause.label.text'),
            quoted: true
        });

        csv.csvBuffered(filtered, options, (___err, data) => {
          if (___err) return _handleError(___err, req, res);
          res.set('Content-Type', 'text/csv; charset=' + config.csv.charset);
          if('utf-8' === config.csv.charset) res.send(data);
          else res.send(encoding.convert(data, config.csv.charset));
        });
      });
    });
  });

});

app.get('/all-users', staff, getRules, function (req, res) {
  log('Request /csv/all-users');

  var locale = req.user ? ( req.user.locale || config.locale ) : config.locale ;

  var query = {
    // 'emailValidated': true
  };

  User
  .find(query)
  .sort('createdAt')
  .exec(function (err, users) {
    if (err) return _handleError(err, req, res);

    log('Found %s users in total', users.length);

    var options = {
      fields: [],
      fieldSeparator: config.csv.separator
    };

    options.fields.push({
        name: 'firstName',
        label: t('settings.first-name'),
        quoted: true
    });
    options.fields.push({
        name: 'lastName',
        label: t('settings.last-name'),
        quoted: true
    });
    options.fields.push({
        name: 'email',
        label: t('signup.email'),
        quoted: false
    });

    if( config.userAge ) {
      options.fields.push({
          name: 'age',
          label: t('settings.age'),
          quoted: true,
          filter: function(value) {
            if(value) return t('settings.age.' + value);
          }
      });
    }

    if( 0 <= config.rules.indexOf('role') ){
      options.fields.push({
          name: 'roles',
          label: t('settings.role'),
          quoted: true,
          filter: function(values) {
            var result = [];
            if(values){
              for (var i = 0; i < values.length; i += 1 ) {
                var value = values[i];
                var rule = arrayFilter(req.ctx.rules, {name: value});
                if(rule.length){
                  result.push(rule[0].value.label[locale] || rule[0].value.label.default);
                }
              }
            }
            return result.join(', ');
          }
      });
    }
    if( 0 <= config.rules.indexOf('location') ){
      options.fields.push({
          name: 'location',
          label: t('settings.location'),
          quoted: true,
          filter: function(value) {
            if(value){
              var rule = arrayFilter(req.ctx.rules, {name: value});
              if(rule.length){
                return rule[0].value.label[locale] || rule[0].value.label.default;
              }
            }
          }
      });
    }
    if( 0 <= config.rules.indexOf('activity') ){
      options.fields.push({
          name: 'activities',
          label: t('settings.activity'),
          quoted: true,
          filter: function(values) {
            var result = [];
            if(values){
              for (var value in values) {
                if (values[value]) {
                  var rule = arrayFilter(req.ctx.rules, {name: value});
                  if(rule.length){
                    result.push(rule[0].value.label[locale] || rule[0].value.label.default);
                  }
                }
              }
            }
            return result.join(', ');
          }
      });
    }

    options.fields.push({
        name: 'avatar',
        label: 'avatar',
        quoted: true
    });

    options.fields.push({
      name: 'id',
      label: 'ID',
      quoted: true
    });

    options.fields.push({
        name: 'emailValidated',
        label: t('common.email-validated'),
        quoted: true,
        filter: function(value) {
          return value ? t('settings-notifications.yes') : t('settings-notifications.no');
        }
    });

    options.fields.push({
        name: 'status',
        label: t('admin-users-form.enabled'),
        quoted: true,
        filter: function(value) {
          return value ? t('admin-users-form.enabled') : t('admin-users-form.disabled');
        }
    });

    options.fields.push({
        name: 'createdAt',
        label: t('common.date.signup'),
        quoted: true,
        filter: function(value) {
          return strftime(value, '%Y-%m-%d-%R');
        }
    });

    options.fields.push({
        name: 'updatedAt',
        label: t('common.date.update'),
        quoted: true,
        filter: function(value) {
          return strftime(value, '%Y-%m-%d-%R');
        }
    });

    csv.csvBuffered(users, options, (__err, data) =>{
      if (__err) return _handleError(__err, req, res);
      res.set('Content-Type', 'text/csv; charset=' + config.csv.charset);
      if('utf-8' === config.csv.charset) res.send(data);
      else res.send(encoding.convert(data, config.csv.charset));
    });
  });

});


function _handleError (err, req, res) {
  log('Error found: %s', err);

  if (err.errors && err.errors.text) err = err.errors.text;
  if (err.type) err = err.type;
  if (err.message) err = err.message;

  res.status(400).json({ error: err });
}

function getRules(req, res, next){
  if(!config.rules) return next();
  Rules.find().exec(function (err, rules) {
    if (err) return _handleError(err, req, res);
    if( !req.ctx ) req.ctx = {};
    req.ctx.rules = rules;
    next();
  });
}
