import request from '../../request/request'
import Store from '../store/store'

class GroupStore extends Store {
  name () {
    return 'group'
  }

  search (query) {
    const url = this.url('search', { q: query })

    const fetch = new Promise((resolve, reject) => {
      request
        .get(url)
        .end((err, res) => {
          if (err) return reject(err)
          resolve(res.body)
        })
    })

    return fetch
  }

  update (group) {
    return new Promise((resolve, reject) => {
      request
        .post(`/api/group/update/${group.id}`)
        .send(group)
        .end((err, res) => {
          if (err) return reject(err)
          resolve(res.body)
        })
    })
  }
}

export default new GroupStore()
