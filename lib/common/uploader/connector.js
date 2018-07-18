import { connect } from 'react-refetch'

const filesSync = filesSyncFactory()
const filesSyncOne = (body) => ({ filesFetch: filesSync.one(body) })

export default connect.defaults({
  handleResponse: handleResponse
})((props) => {
  filesSync.setTopic(props.topic.id)

  const fetchAll = () => ({
    url: `/api/v2/files${objectToParams(filesSync.params)}`,
    then: filesSync.all
  })

  const filesFetch = fetchAll()

  const handleSort = (sort) => {
    filesSync.setSort(sort)
    return { filesFetch: fetchAll() }
  }

  const handleNextPage = () => {
    filesSync.nextPage()
    return { filesFetch: fetchAll() }
  }

  const handleUpload = (data) => {
    const body = Object.assign({}, data, { topicId: props.topic.id })

    return {
      filesCreating: {
        url: `/api/v2/upload`,
        method: 'POST',
        force: true,
        body: JSON.stringify(body),
        andThen: filesSyncOne
      }
    }
  }

  const handleDelete = (data) => ({
    fileDeleting: {
      url: `/api/v2/files`,
      method: 'DELETE',
      force: true,
      body: JSON.stringify(data),
      andThen: () => ({ filesFetch: filesSync.remove(data.id) })
    }
  })

  return {
    filesFetch,
    handleUpload,
    handleDelete,
    handleSort,
    handleNextPage
  }
})

function filesSyncFactory () {
  let items = []

  const params = {
    topicId: null,
    sort: '-score'
  }

  const pagination = {
    count: 0,
    page: 1,
    pageCount: 1
  }

  const sync = {
    get params () {
      return {
        topicId: params.topicId,
        sort: params.sort,
        page: pagination.page
      }
    },

    setTopic (val) {
      if (params.topicId === val) return

      sync.clear()
      params.topicId = val
    },

    setSort (val) {
      if (params.sort === val) return

      sync.clear()
      params.sort = val
    },

    clear () {
      items = []
      pagination.page = 1
    },

    nextPage () {
      if (pagination.page >= pagination.pageCount) {
        throw new Error('Requested an invalid page.')
      }

      pagination.page++
    },

    all (body) {
      if (body.pagination && body.pagination.page === 1) {
        sync.clear()
      }

      items = items.concat(body.results.files)
      Object.assign(pagination, body.pagination)

      delete body.results

      return {
        value: items.slice(),
        meta: body,
        force: true,
        refreshing: true
      }
    },

    one (body) {
      const file = body.results.file

      var i = -1
      items.some((c, index) => {
        if (c.id === file.id) {
          i = index
          return true
        }
      })

      delete body.results

      if (i === -1) {
        items.unshift(file)
      } else {
        items[i] = file
      }

      return {
        value: items,
        meta: body,
        force: true,
        refreshing: true
      }
    },

    remove (id) {
      var i = -1
      items.some((c, index) => {
        if (c.id === id) {
          i = index
          return true
        }
      })

      if (i > -1) items.splice(i, 1)

      return {
        value: items,
        force: true,
        refreshing: true
      }
    }
  }

  return sync
}

function handleResponse (response) {
  const isEmptyResponse = response.headers.get('content-length') === '0'

  if (isEmptyResponse || response.status === 204) return

  const json = response.json()

  if (response.status < 200 || response.status > 300) {
    return json.then((err) => Promise.reject(err))
  }

  return json
}

function objectToParams (obj = {}) {
  const vals = Object.keys(obj)
    .map((k) => `${k}=${encodeURIComponent(obj[k])}`)
    .join('&')

  return vals ? '?' + vals : ''
}
