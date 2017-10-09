import t from 't-component'

const mapping = {
  'common.sorts.label': 'fa-sort',
  'common.sorts.by-title-asc': 'fa-sort-alpha-asc',
  'common.sorts.closing-soon': 'fa-exclamation',
  'common.sorts.newest-first': 'fa-sort-numeric-desc',
  'common.sorts.oldest-first': 'fa-sort-numeric-asc',
  'common.sorts.random': 'fa-random',
  'common.sorts.recently-updated': 'fa-clock-o',
  'common.sorts.score': 'fa-sort-amount-desc'
}

export default (key, visible = true, align = 'left') => {
  const icon = `<i class="fa fa-fw ${mapping[key]}"></i>`
  const spacer = visible ? '&nbsp' : ''
  const text = `<span class="${visible ? '' : 'sr-only'}">${t(key)}</span>`

  if (align === 'right') {
    return text + spacer + icon
  } else {
    return icon + spacer + text
  }
}
