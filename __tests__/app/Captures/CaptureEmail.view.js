// This file is auto-generated. Edit CaptureEmail.view to change it. More info: https://github.com/viewstools/docs/blob/master/UseViews/README.md#viewjs-is-auto-generated-and-shouldnt-be-edited
/* eslint-disable jsx-a11y/accessible-emoji, no-unused-vars, no-dupe-keys */
import React from 'react'
import { css } from 'emotion'

let styles = {}
styles.Capture = css({
  label: 'Capture',
  color: '#404040',
  '&:hover:enabled': {
    color: '#808080',
  },
  '&:focus:enabled': {
    color: '#a0a0a0',
  },
  '&::placeholder': {
    color: '#323232',
  },
})

let CaptureEmail = props => {
  return (
    <React.Fragment>
      <input
        type="email"
        data-testid="CaptureEmail.Capture"
        onChange={props.onChange}
        placeholder="Type an email"
        value={props.value}
        className={`views-capture ${styles.Capture}`}
      />
      {props.children}
    </React.Fragment>
  )
}

export default CaptureEmail
