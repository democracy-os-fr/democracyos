import t from 't-component'

const mapping = {
  'common.sorts.label': 'fa-sort',
  'common.sorts.by-title-asc': 'fa-sort-alpha-asc',
  'common.sorts.closing-soon': 'fa-exclamation',
  'common.sorts.newest-first': 'fa-sort-numeric-desc',
  'common.sorts.oldest-first': 'fa-sort-numeric-asc',
  'common.sorts.random': 'fa-random',
  'common.sorts.recently-updated': 'fa-clock-o',
  'common.sorts.score': 'fa-sort-amount-desc',
  'common.topic': 'fa-sticky-note',
  'common.forum': 'fa-list-alt',
  'admin-permissions.visibility.public.title': 'fa-user-circle-o',
  'admin-permissions.visibility.collaborative.title': 'fa-pencil',
  'admin-permissions.visibility.closed.title': 'fa-lock',
  'admin-permissions.visibility.private.title': 'fa-eye-slash',
  'common.user': 'fa-user-circle-o',
  'common.users': 'fa-users'
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
