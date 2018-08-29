import React from 'react'

function SearchResult (props) {
  return <div>{renderList(props)}</div>
}
function renderList (props) {
  return props.groups.map((group) => {
    return (<div key={group.id} onClick={() => props.selectGroup(group)}>
      <h4>{group.name}</h4>
    </div>
    )
  })
}
export default SearchResult
