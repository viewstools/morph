/* eslint-disable jsx-a11y/accessible-emoji */
import React from 'react'
import css from 'glam'

import './Preview.view.css'
const styles = { h15teuz8: css('css-bjavay') }

const Preview = props =>
  <div className={`${styles.h15teuz8}`} style={{ width: `${props.width}` }}>
    {props.children}
  </div>

export default Preview
// fonts {}
