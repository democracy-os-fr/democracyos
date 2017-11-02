const Vote = require('lib/models').Vote

/**
* Check for vote status of user
*
* @param {ObjectId} user
* @param {ObjectId} topic
* @api public
*/

function votedBy (user, topic) {
  if (!user || (topic.action.count === 0)) return Promise.resolve(false)
  return Vote.find({ topic: topic._id, author: user._id }).then((topicVote) => topicVote.length > 0 && topicVote[0].value)
}

exports.votedBy = votedBy

/**
* Calculate votes results
*
* @param {ObjectId} topic
* @api public
*/

function calcResult (topic) {
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
      if (!counts[vote.value]) counts[vote.value] = 0
      counts[vote.value]++
      return counts
    }, {})

    const votesPercentages = {}

    options.forEach((opt) => {
      if (!votesCounts[opt]) votesCounts[opt] = 0
      votesPercentages[opt] = 100 / votes.length * votesCounts[opt] || 0
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

exports.calcResult = calcResult
