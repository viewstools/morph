// This file is auto-generated. Edit Users.view to change it. More info: https://github.com/viewstools/docs/blob/master/UseViews/README.md#viewjs-is-auto-generated-and-shouldnt-be-edited
/* eslint-disable jsx-a11y/accessible-emoji, no-unused-vars, no-dupe-keys */
import Name from './Users/Name.view.logic.js'
import React from 'react'
import Surname from './Users/Surname.view.logic.js'
import useIsBefore from '../../useIsBefore.js'
import { css } from 'emotion'

let styles = {}
styles.Vertical = css({
  label: 'Vertical',
  alignSelf: 'flex-start',
  borderBottomLeftRadius: 4,
  borderBottomRightRadius: 4,
  borderColor: '#404040',
  borderStyle: 'solid',
  borderTopLeftRadius: 4,
  borderTopRightRadius: 4,
  borderWidth: 1,
  marginBottom: 8,
  marginLeft: 8,
  marginRight: 8,
  marginTop: 8,
  paddingBottom: 12,
  paddingLeft: 24,
  paddingRight: 24,
  paddingTop: 12,
  userSelect: 'none',
  transition: 'opacity 150ms linear',
  willChange: 'opacity',
  opacity: 'var(--opacity)',
})

let Users = props => {
  let isBefore = useIsBefore()

  return (
    <React.Fragment>
      <button
        data-testid="Users.Vertical"
        onClick={props.onClick}
        style={{ '--opacity': `${isBefore ? 0 : 1}` }}
        className={`views-block ${styles.Vertical}`}
      >
        <Name data-testid="Users.Name" />
        <Surname data-testid="Users.Surname" />
      </button>
      {props.children}
    </React.Fragment>
  )
}

export default Users
