import { connect } from 'react-refetch'

export default connect((props) => {
  return {
    fetchAll: '/api/v2/group/all',
    fetchOne: `/api/v2/group/${props.params.id}`,
    handleCreate: (data) => ({
      groupsCreating: {
        url: `/api/v2/groups`,
        method: 'POST',
        force: true,
        body: JSON.stringify(data)
      }
    }),
    handleDelete: (data) => ({
      groupDeleting: {
        url: `/api/v2/groups/${data.id}`,
        method: 'DELETE',
        force: true,
        body: JSON.stringify(data)
      }
    }),
    handleEdit: (id, data) => ({
      groupsUnflagging: {
        url: `/api/v2/groups/${id}`,
        method: 'PUT',
        force: true,
        body: JSON.stringify(data)
      }
    })
  }
})
