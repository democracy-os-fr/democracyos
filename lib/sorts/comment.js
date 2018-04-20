import sortBy from 'mout/array/sortBy'
import sort from 'mout/array/sort'
import shuffle from 'mout/array/shuffle'
// import config from 'lib/config'

export default (set, by) => {
  switch (by) {
    case 'score':
      return sortBy(set, 'score')
    case 'newest-first':
      return sort(set, (a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt)
      })
    case 'oldest-first':
      return sort(set, (a, b) => {
        return new Date(a.createdAt) - new Date(b.createdAt)
      })
    case 'random':
      return shuffle(set)
    default:
      return set
  }
}
