
const log = require('debug')('democracyos:api:db:utils:topics')
const unique = require('mout/array/unique')
const union = require('mout/array/union')
const collect = require('mout/array/collect')
const pluck = require('mout/array/pluck')
const ObjectID = require('mongoose').Types.ObjectId
const difference = require('lodash.difference')
const { Topic, Vote, Comment } = require('lib/models')
const getValuesFromObject = require('mout/object/values')

/**
* Remove vote to change it.
*
* @param {ObjectId} user
* @param {ObjectId} topic
* @api public
*/

exports.removeOwnVote = function (user, topic) {
  return Vote.remove({ topic: topic._id, author: user._id })
    .then((writeOpResult) => writeOpResult.nMatched !== 0)
}

/**
* Check for vote status of user
*
* @param {ObjectId} user
* @param {ObjectId} topic
* @api public
*/

exports.votedBy = function votedBy (user, topic) {
  if (!user || (topic.action.count === 0)) return Promise.resolve(false)
  return Vote.find({ topic: topic._id, author: user._id }).then((topicVote) =>
    topicVote.length > 0 && topicVote[0].value
  )
}

/**
* Calculate votes results
*
* @param {ObjectId} topic
* @api public
*/

exports.calcResult = function calcResult (topic) {
  return Vote.find({ topic: topic._id }).then((votes) => {
    let options = topic.action.results.map((o) => o.value)
    let votesPercentages = {}

    if (!options.length) {
      switch (topic.action && topic.action.method) {
        case 'vote':
          options = ['positive', 'neutral', 'negative']
          break
        case 'cause':
          options = ['support']
          break
      }
    }

    if (topic.action.method === 'hierarchy') {
      let result = []
      let fieldsToExclude = []

      const values = votes.map((vote) => vote.value.split(','))

      const count = countByPosition(values, options)

      const levels = Array(count.length).fill().map(Object)

      const optionsWithMaxVotes = getOptionsWithVotes(levels, count)

      optionsWithMaxVotes.forEach((level, index) => {
        result.push(...getMaxValues(optionsWithMaxVotes, level, index, fieldsToExclude))
      })

      const value = Object.keys(Object.assign({}, ...result))

      return {
        results: value.map((val, index) => ({
          value: val,
          position: index + 1
        })),
        matriz: count,
        count: votes.length
      }
    } else {
      const votesCounts = votes.reduce(function (counts, vote) {
        // if (!counts[vote.value]) counts[vote.value] = 0
        // counts[vote.value]++
        // return counts

        function pushVote (val) {
          if (!counts[val]) counts[val] = 0
          counts[val]++
        }

        // if (topic.action && topic.action.multiple) {
        //   let values = JSON.parse(vote.value)
        //   for (let value of values) {
        //     pushVote(value)
        //   }
        // } else {
        //   pushVote(vote.value)
        // }

        let values = []
        try {
          values = JSON.parse(vote.value)
        } catch (e) {
          values = vote.value
        }
        if (!Array.isArray(values)) {
          values = [values]
        }

        for (let value of values) {
          pushVote(value)
        }

        return counts
      }, {})

      options.forEach((opt) => {
        if (!votesCounts[opt]) votesCounts[opt] = 0
        votesPercentages[opt] = 100 / votes.length * votesCounts[opt] || 0
      })

      return {
        results: options.map((opt) => ({
          value: opt,
          percentage: parseFloat(votesPercentages[opt].toFixed(2)),
          votes: votesCounts[opt]
        })),
        count: votes.length
      }
    }
  })

  //   const votesCounts = votes.reduce(function (counts, vote) {
  //     function pushVote (val) {
  //       if (!counts[val]) counts[val] = 0
  //       counts[val]++
  //     }
  //
  //     // if (topic.action && topic.action.multiple) {
  //     //   let values = JSON.parse(vote.value)
  //     //   for (let value of values) {
  //     //     pushVote(value)
  //     //   }
  //     // } else {
  //     //   pushVote(vote.value)
  //     // }
  //
  //     let values = []
  //     try {
  //       values = JSON.parse(vote.value)
  //     } catch (e) {
  //       values = vote.value
  //     }
  //     if (!Array.isArray(values)) {
  //       values = [values]
  //     }
  //
  //     for (let value of values) {
  //       pushVote(value)
  //     }
  //
  //     return counts
  //   }, {})
  //
  //   const votesPercentages = {}
  //
  //   // const votesTotal = getValuesFromObject(votesCounts).reduce((result, count) => {
  //   //   return result + count
  //   // }, 0)
  //
  //   options.forEach((opt) => {
  //     if (!votesCounts[opt]) votesCounts[opt] = 0
  //     votesPercentages[opt] = 100 / votes.length * votesCounts[opt] || 0
  //     // votesPercentages[opt] = votesCounts[opt] * 100 / votesTotal || 0
  //   })
  //   return {
  //     results: options.map((opt) => ({
  //       value: opt,
  //       percentage: parseFloat(votesPercentages[opt].toFixed(2)),
  //       count: votesCounts[opt]
  //     })),
  //     count: votes.length
  //   }
  // })
}

/**
* Order options by votes.
*
* @param {Array} options
* @param {Array} optionsArray
* @api public
*/

function countByPosition (values, options) {
  const positions = []
  const count = []

  values.forEach((value) => {
    value.forEach((v, index) => {
      if (!positions[index]) positions[index] = []
      positions[index].push(v)
    })
  })

  positions.forEach((position) => {
    const map = position.reduce((prev, cur) => {
      prev[cur] = (prev[cur] || 0) + 1
      return prev
    }, {})
    count.push(map)
  })

  options.forEach((opt) => {
    count.forEach((position) => {
      if (!position[opt]) position[opt] = 0
    })
  })

  return count
}

/**
* Sum votes including deep positions.
*
* @param {Array} result
* @param {Array} count
* @param {Number} position
* @api public
*/

function getOptionsWithVotes (result, count, position = 0) {
  // Sum votes including deep positions.
  Object.keys(count[position]).forEach((field, index) => {
    for (let positionCount = 0; positionCount <= position; positionCount++) {
      result[position][field] = (result[position][field] || 0) + count[positionCount][field]
    }
  })

  if (typeof result[position + 1] !== 'undefined') getOptionsWithVotes(result, count, position + 1)

  return result
}

/**
* Get the winning proposal per position.
*
* @param {Array} optionsWithMaxVotes
* @param {Array} level
* @param {Number} index
* @param {Array} fieldsToExclude
* @param {Array} fieldsTofind
* @api public
*/

function getMaxValues (optionsWithMaxVotes, level, index, fieldsToExclude = [], fieldsTofind = []) {
  let maxField = []
  let whereFind = !fieldsTofind.lenght ? difference(Object.keys(level), fieldsToExclude) : difference(fieldsTofind, fieldsToExclude)

  whereFind.forEach((field, index) => {
    if (!maxField.length) {
      maxField.push({ [field]: level[field] })
    } else {
      maxField.forEach((obj) => {
        const values = Object.keys(obj).map((key) => obj[key]) // === Object.values.
        values.forEach((value) => {
          if (value === level[field]) {
            maxField.push({ [field]: level[field] })
          }
          if (value < level[field]) {
            maxField = []
            maxField.push({ [field]: level[field] })
          }
        })
      })
    }
  })

  if (maxField.length > 1) {
    maxField = getMaxValues(optionsWithMaxVotes, optionsWithMaxVotes[index + 1], index + 1, fieldsToExclude, Object.keys(maxField))
  }

  fieldsToExclude.push(...Object.keys(maxField[0]))

  return maxField
}

/**
* Calculate statistics
*
* @param {ObjectId} topic
* @api public
*/

exports.calcStats = function calcStats (topic) {
  const start = process.hrtime()
  let data = {}

  const authors = function (a, b) {
    const aId = a.get ? a.get('_id') : a
    const bId = b.get ? b.get('_id') : b
    return aId.equals ? aId.equals(bId) : aId === bId
  }

  return Vote.find({ topic: topic._id })
  .then((votes) => {
    data.votes = votes
  })
  .then(() => Comment.find({
    context: 'topic',
    reference: topic._id.toString()
  }))
  .then((comments) => {
    data.comments = comments
  })
  .then(() => {
    let voters = unique(pluck(data.votes, 'author'), authors)
    let replies = collect(data.comments, 'replies')
    let commenters = data.comments.length ? unique(pluck(data.comments, 'author'), authors) : []
    let repliers = replies.length ? unique(union(commenters, pluck(replies, 'author')), authors) : []
    let ratings = collect(data.comments, 'votes')
    let raters = ratings.length ? unique(pluck(ratings, 'author'), authors) : []
    let participants = unique(union(voters, repliers, raters), authors)

    const end = process.hrtime(start)
    log('calcStats finished in %s.%s seconds', end[0], end[1])
    return {
      votes: data.votes.length,
      voters: voters.length,
      replies: replies.length + data.comments.length,
      repliers: repliers.length,
      ratings: ratings.length,
      raters: raters.length,
      participants: participants.length
    }
  })
  .catch(function (err) {
    throw err
  })
}

exports.updateTopicFromComment = function updateTopicFromComment (data) {
  const _id = new ObjectID(data.reference)
  return exports.calcStats({ _id })
  .then((count) => Topic.collection.findOneAndUpdate({ _id }, { $set: { 'count': count } }))
  .then((topic) => {
    log('topic %s updated', _id)
  })
  .catch((error) => {
    log(error)
  })
}
