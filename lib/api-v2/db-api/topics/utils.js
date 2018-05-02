const getValuesFromObject = require('mout/object/values')
const { Vote } = require('lib/models')

/**
* Check for vote status of user
*
* @param {ObjectId} user
* @param {ObjectId} topic
* @api public
*/

exports.votedBy = function votedBy (user, topic) {
  if (!user || (topic.action.count === 0)) return Promise.resolve(false)
  return Vote.find({ topic: topic._id, author: user._id }).then((topicVote) => topicVote.length > 0 && topicVote[0].value)
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

    const votesCounts = votes.reduce(function (counts, vote) {
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

    const votesPercentages = {}

    // const votesTotal = getValuesFromObject(votesCounts).reduce((result, count) => {
    //   return result + count
    // }, 0)

    options.forEach((opt) => {
      if (!votesCounts[opt]) votesCounts[opt] = 0
      votesPercentages[opt] = 100 / votes.length * votesCounts[opt] || 0
      // votesPercentages[opt] = votesCounts[opt] * 100 / votesTotal || 0
    })
    return {
      results: options.map((opt) => ({
        value: opt,
        percentage: parseFloat(votesPercentages[opt].toFixed(2)),
        count: votesCounts[opt]
      })),
      count: votes.length
    }
  })
}
