// This file is auto-generated. Edit Surname.view to change it. More info: https://github.com/viewstools/docs/blob/master/UseViews/README.md#viewjs-is-auto-generated-and-shouldnt-be-edited
/* eslint-disable jsx-a11y/accessible-emoji, no-unused-vars, no-dupe-keys */
import '../../../Fonts/WonderUnitSans-300.js'
import React from 'react'
import { css } from 'emotion'

let styles = {}
styles.Text = css({
  label: 'Text',
  fontFamily: 'WonderUnitSans',
  fontSize: 18,
  fontWeight: 300,
})

let Surname = props => {
  return (
    <React.Fragment>
      <span data-testid="Surname.Text" className={`views-text ${styles.Text}`}>
        {props.text}
      </span>
      {props.children}
    </React.Fragment>
  )
}
Surname.defaultProps = { text: 'Summers' }
export default Surname
