/* eslint-disable jsx-a11y/accessible-emoji */
import React from 'react'
import Code from './Code.js'
import Tab from './Tab.view.js'
import css from 'glam'

import './Editor.view.css'
const styles = {
  hhug0vo: css('css-1ynz1qo'),
  hozbj4v: css('css-copx'),
  hm7nco4: css('css-1toe4k0'),
}

const Editor = props =>
  <div className={`${styles.hhug0vo}`}>
    <div className={`${styles.hozbj4v}`}>
      <Tab onClick={props.showView} text="View" />
      <Tab onClick={props.showTests} text="Tests" />
      <Tab onClick={props.showLogic} text="Logic" />
      <Tab onClick={props.showViewJs} text="JS" />
    </div>
    <div className={`${styles.hm7nco4}`}><Code file={props.tab} /></div>
    {props.children}
  </div>

export default Editor
// fonts {}
