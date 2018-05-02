import naturalCompare from 'string-natural-compare'
import sort from 'mout/array/sort'
import shuffle from 'mout/array/shuffle'
// import config from 'lib/config'

export default (set, by) => {
  switch (by) {
    case 'by-title-asc':
      return sort(set, (a, b) => {
        return naturalCompare(a.mediaTitle, b.mediaTitle)
      })
    case 'closing-soon':
      return sort(set, (a, b) => {
        if (!a.closingAt && !b.closingAt) {
          // If closingAt isn't defined in both, they're equal
          return 0
        }
        // undefined closingAt always goes last
        // b goes first in this case
        if (!a.closingAt) {
          return 1
        }
        // undefined closingAt always goes last
        // a goes first in this case
        if (!b.closingAt) {
          return -1
        }
        // Closest date first
        return new Date(a.closingAt) - new Date(b.closingAt)
      })
    case 'newest-first':
      return sort(set, (a, b) => {
        return new Date(b.publishedAt) - new Date(a.publishedAt)
      })
    case 'oldest-first':
      return sort(set, (a, b) => {
        return new Date(a.publishedAt) - new Date(b.publishedAt)
      })
    case 'random':
      return shuffle(set)
    case 'recently-updated':
      return sort(set, (a, b) => {
        return new Date(b.updatedAt) - new Date(a.updatedAt)
      })
    default:
      return set
  }
}
