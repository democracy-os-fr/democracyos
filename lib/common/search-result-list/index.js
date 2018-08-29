import React from 'react'

function SearchResult (props) {
  return <div>{renderList(props)}</div>
}
function renderList (props) {
  return props.groups.map((group) => {
    return (<div key={group.id} className='Groupsdisplay' onClick={() => props.selectGroup(group)}>
      <h4 className='groupName'>{group.name}</h4>
      <img className='imageGroups' src={group.logoUrl} />
    </div>
    )
  })
}
export default SearchResult
