import React from 'react'
import { ListGroup, ListGroupItem, Media } from 'react-bootstrap'
import t from 't-component'
import isEmpty from 'mout/lang/isEmpty'

function SearchResult (props) {
  return <div>{renderList(props)}</div>
}
function renderList (props) {
  const classes = ['group-search-results']
  if (props.isSearching) classes.push(' searching')
  return (
    <ListGroup className={classes.join(' ')}>
      {props.groups.map((group) =>
        <ListGroupItem key={group.id} onClick={() => props.selectGroup(group)}>
          <Media>
            <Media.Left align='middle'>
              <img src={group.logoUrl} />
            </Media.Left>
            <Media.Body className='media-middle'>
              <b>{group.name}</b>
            </Media.Body>
          </Media>
        </ListGroupItem>
      )}
      {isEmpty(props.groups) && (
        <ListGroupItem className='empty'>{t('validators.not.match')}</ListGroupItem>
      )}
    </ListGroup>
  )
}
export default SearchResult
