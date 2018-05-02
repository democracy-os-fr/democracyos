export default {
  positive: {
    alert: {
      className: 'vote-yes',
      text: 'proposal-options.voted-yea'
    },
    button: {
      className: 'vote-yes',
      text: 'proposal-options.yea',
      icon: 'icon-like'
    }
  },
  neutral: {
    alert: {
      className: 'vote-abstain',
      text: 'proposal-options.voted-abstained'
    },
    button: {
      className: 'vote-abstain',
      text: 'proposal-options.abstain',
      icon: 'icon-control-pause'
    }
  },
  negative: {
    alert: {
      className: 'vote-no',
      text: 'proposal-options.voted-nay'
    },
    button: {
      className: 'vote-no',
      text: 'proposal-options.nay',
      icon: 'icon-dislike'
    }
  }
}
