/* eslint-disable jsx-a11y/accessible-emoji */
import React from 'react'
import './Tab.view.css'
const styles = { hyekb9i: 'css-1eza8e1', htspu76: 'css-9fpys5' }

const Tab = props =>
  <button
    onClick={props.onClick}
    className={`${styles.hyekb9i} ${props.isActive && 'active'}`}
  >
    <div className={styles.htspu76}>{props.text}</div>{props.children}
  </button>

export default Tab
// fonts {"Montserrat":["600"]}
