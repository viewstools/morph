/* eslint-disable jsx-a11y/accessible-emoji */
import React from 'react'
import Code from './Code.js'
import Tab from './Tab.view.js'
import css from 'glam'

import './Editor.view.css'
const styles = {
  hnx90gz: css('css-1j0qhzu'),
  hozbj4v: css('css-copx'),
  hm7nco4: css('css-1toe4k0'),
}

const Editor = props =>
  <div className={`${styles.hnx90gz}`}>
    <div className={`${styles.hozbj4v}`}>
      <Tab isActive={props.showingView} onClick={props.showView} text="View" />
      <Tab
        isActive={props.showingTests}
        onClick={props.showTests}
        text="Tests"
      />
      <Tab
        isActive={props.showingLogic}
        onClick={props.showLogic}
        text="Logic"
      />
      <Tab
        isActive={props.showingViewJs}
        onClick={props.showViewJs}
        text="JS"
      />
    </div>
    <div className={`${styles.hm7nco4}`}>
      <Code
        file={props.tab}
        height={props.height - 70}
        width={props.width - 20}
      />
    </div>
    {props.children}
  </div>

export default Editor
// fonts {}
