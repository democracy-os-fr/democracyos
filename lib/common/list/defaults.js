import t from 't-component'

const filters = {
  list: [
    {
      key: 'type',
      value: 'public',
      label: t('forum.visibility.public.title')
    },
    {
      key: 'type',
      value: 'private',
      label: t('forum.visibility.private.title')
    },
    {
      divider: true
    },
    {
      key: 'flag',
      value: true,
      label: 'flag !!'
    }
  ]
}

const sorts = {
  current: 'newest-first',
  order: 0,
  list: [
    {
      key: 'createdAt',
      value: 'newest-first',
      label: t('common.sorts.newest-first')
    },
    {
      key: 'createdAt',
      value: 'by-title-asc',
      label: t('common.sorts.by-title-asc')
    }
  ]
}

const elements = [
  {
    _id: 1,
    name: 'aaaa',
    type: 'public',
    createdAt: '2017-05-05 12:00:00.670Z',
    flag: false
  },
  {
    _id: 2,
    name: 'bbbb',
    type: 'public',
    createdAt: '2017-06-10 12:00:00.670Z',
    flag: true
  },
  {
    _id: 3,
    name: 'cccc',
    type: 'private',
    createdAt: '2017-08-15 12:00:00.670Z',
    flag: false
  },
  {
    _id: 4,
    name: 'aaab',
    type: 'public',
    createdAt: '2017-05-25 12:00:00.670Z',
    flag: true
  }
]

export default { filters, sorts, elements }
