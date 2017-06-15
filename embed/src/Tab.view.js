/* eslint-disable jsx-a11y/accessible-emoji */
import React from 'react'
import css from 'glam'

import './Tab.view.css'
const styles = { h1sw8bde: css('css-gxi4di'), htspu76: css('css-9fpys5') }

const Tab = props =>
  <button
    onClick={props.onClick}
    className={`${styles.h1sw8bde} ${props.isActive && 'active'}`}
  >
    <div className={`${styles.htspu76}`}>{props.text}</div>{props.children}
  </button>

export default Tab
// fonts {"Montserrat":["600"]}
