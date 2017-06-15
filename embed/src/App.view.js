/* eslint-disable jsx-a11y/accessible-emoji */
import React from 'react'
import Editor from './Editor.view.logic.js'
import Preview from './Preview.view.logic.js'
import css from 'glam'

import './App.view.css'
const styles = { h19fvk5s: css('css-1dzbgcl') }

const App = props =>
  <div className={`${styles.h19fvk5s}`}>
    <Preview /><Editor />{props.children}
  </div>

export default App
// fonts {}
