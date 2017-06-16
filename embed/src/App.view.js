/* eslint-disable jsx-a11y/accessible-emoji */
import React from 'react'
import Editor from './Editor.view.logic.js'
import Preview from './Preview.view.logic.js'
import css from 'glam'

import './App.view.css'
const styles = { ha2nw6v: css('css-11mcv1e') }

const App = props =>
  <div className={`${styles.ha2nw6v}`}>
    <Preview width={300} />
    <Editor height={props.height} width={props.width - 300} />{props.children}
  </div>

export default App
// fonts {}
