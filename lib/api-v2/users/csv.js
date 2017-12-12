const express = require('express')
const debug = require('debug')
const t = require('t-component')
const guid = require('mout/random/guid')
const set = require('mout/object/set')
const csv2json = require('json-2-csv').csv2json
// const config = require('lib/config')
const signup = require('lib/api/signup/lib/signup')
const middlewares = require('../middlewares')

const log = debug('democracyos:api:user:csv')
const app = module.exports = express()

app.post('/users.csv',
middlewares.users.system,
function postCsv (req, res) {
  const body = req.body.csv
  csv2json(body, function (err, json) {
    if (err) {
      log('get csv: array to csv error', err)
      return res.status(500).json(err)
    }
    log('USERS CVS IMPORT')
    log(json)

    Promise.all(json.map((profile) => {
      return new Promise((resolve, reject) => {
        let meta = {
          ip: req.ip,
          ips: req.ips,
          host: req.get('host'),
          origin: req.get('origin'),
          referer: req.get('referer'),
          ua: req.get('user-agent')
        }
        set(profile, 'extra.importRef', guid())
        signup.doSignUp(profile, meta, function (err) {
          console.log('doSignUp callback')
          if (err) {
            if (err.name === 'UserExistsError') {
              log(`${profile.email} KO : ${t('signup.email-exist')}`)
              reject(new Error(`${profile.email} KO : ${t('signup.email-exist')}`))
            }
            log(`${profile.email} KO : ${err}`)
            reject(new Error(`${profile.email} KO : ${err}`))
          } else {
            log(`${profile.email} OK`)
            resolve(`${profile.email} OK`)
          }
        })
      })
    })).then((results) => {
      log(results)
      return res.status(200).json(results)
    }).catch((e) => {
      log(e)
      return res.status(500).json(e)
    })

    // var batch = (profile) => {
    //   let meta = {
    //     ip: req.ip,
    //     ips: req.ips,
    //     host: req.get('host'),
    //     origin: req.get('origin'),
    //     referer: req.get('referer'),
    //     ua: req.get('user-agent')
    //   }
    //   set(profile, 'extra.importRef', guid())
    //   batch.push(signup.doSignUp(profile, meta, (err) => {
    //     if (err) {
    //       if (err.name === 'UserExistsError') {
    //         log(`${profile.email} KO : ${t('signup.email-exist')}`)
    //         return `${profile.email} KO : ${t('signup.email-exist')}`
    //       }
    //       log(`${profile.email} KO : ${err}`)
    //       return `${profile.email} KO : ${err}`
    //     } else {
    //       log(`${profile.email} OK`)
    //       return `${profile.email} OK`
    //     }
    //   }))
    //
    //   return new Promise((resolve) => setTimeout(() => resolve(v * 2), 100))
    // }
    //
    // var actions = json.map(batch)
    //
    // var results = Promise.all(actions) // pass array of promises
    //
    // results.then((data) => // or just .then(console.log)
    //     console.log(data) // [2, 4, 6, 8, 10]
    // )
    //
    // for (var profile of json) {
    //
    // }
    //
    // Promise.all(batch).then((results) => {
    //   log('results %o', results)
    //   return res.status(200).json(results)
    // }).catch((e) => {
    //   error.push(error)
    //   if (e) { return res.status(500).json(e) }
    // })
  })
})
