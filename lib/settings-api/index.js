/**
 * Module dependencies.
 */

var express = require('express');
var utils = require('lib/utils');
var restrict = utils.restrict;
var log = require('debug')('democracyos:settings');
var t = require('t-component');
var api = require('lib/db-api');
var forOwn = require('mout/object/forOwn');
var startsWith = require('mout/string/startsWith');
var replace = require('mout/string/replace');
var lowerCase = require('mout/string/lowerCase');
/**
 * Exports Application
 */

var app = module.exports = express();

app.post('/profile', restrict, function(req, res) {
  var user = req.user;
  log('Updating user %s profile', user.id);

  user.firstName = req.body.firstName;
  user.lastName = req.body.lastName;
  user.custom = req.body.custom;

  // TODO Delete old file if new profile picture and previous one was on s3
  /*if(req.body.profilePictureUrl !== user.profilePictureUrl && user.profilePictureUrl.indexOf("demos-paris.s3.amazonaws.com") > -1){
    var deleteParam = {
      Bucket: 'demos-paris',
      Delete: {
          Objects: [
              {Key: '1.txt'}
          ]
      }
    };
    s3.deleteObjects(deleteParam, function(err, data) {
        if (err) console.log(err, err.stack);
        else console.log('delete', data);
    });
  }*/

  user.profilePictureUrl = req.body.profilePictureUrl;
  user.locale = req.body.locale;
  user.location = req.body.location;
  user.age = req.body.age;

  var activities = {};
  forOwn(req.body, function (val, key){
    if (startsWith(key, 'activity')) {
      activities[lowerCase(replace(key, 'activity', ''))] = val;
    }
  });
  user.activities = activities;

  // Temporarily disable email submission, until we fix the whole flow
  // Also check  ./settings-profile/view.js
  // Fixes https://github.com/DemocracyOS/app/issues/223
  // user.email = req.body.email;

  if (user.isModified('email')) {
    log('User must validate new email');
    user.emailValidated = false;
  }

  user.save(function(err) {
    if (err) return res.send(500);
    res.send(200);
  });
});

app.post('/roles/:id', restrict, function(req, res) {
  if(req.user.staff){

    var id = req.params.id ;
    var data = {};
    if(req.body.status){
      data.status = req.body.status;
    }
    if(req.body.roles){
      data.roles = req.body.roles;
    }
    api.user.get(id,function(err,user){
      if(err) res.send(400,{error:err});
      user.set(data);
      user.save(function(err,user){
        if(err) res.send(400,{error:err});
        res.send(200);
      });
    });
  } else {
    res.send(403);
  }
});

app.post('/password', restrict, function(req, res) {
  var user = req.user;
  var current = req.body.current_password;
  var password = req.body.password;
  log('Updating user %s password', user.id);

  // !!:  Use of passport-local-mongoose plugin method
  // `authenticate` to check if user's current password is Ok.
  user.authenticate(current, function(err, authenticated) {
    if (err) return res.json(500, { error: err.message });
    // I have to send a 200 here because FormView can't show the actual error if other response code is sent.
    // This have to be modified with #531 referring to error handling in the backend.
    if (!authenticated) return res.json(200, { error: t('settings.password-invalid') });

    user.setPassword(password, function(err) {
      if (err) return res.json(500, { error: err.message });

      user.save(function(err) {
        if (err) return res.json(500, { error: err.message });
        res.send(200);
      });
    });
  });
});

app.post('/notifications', restrict, function(req, res) {
  log('Updating notifications settings with these new ones %j', req.body);
  var user = req.user;
  var notifications = {};
  notifications.replies = !!req.body.replies;
  notifications['new-topic'] = !!req.body['new-topic'];
  if(user.staff){
    notifications['new-comment'] = !!req.body['new-comment'];
  }
  user.notifications = notifications;
  user.save(function (err) {
    if (err) return res.send(500);
    res.send(200);
  });
});
