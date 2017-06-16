/* eslint-disable jsx-a11y/accessible-emoji */
import React from 'react'
import Animated from 'animated/lib/targets/react-dom.js'
import Editor from './Editor.view.logic.js'
import Preview from './Preview.view.logic.js'
import './App.view.css'
const styles = { h1nzd1pe: 'css-7ou9k9' }

const App = props =>
  <Animated.div
    className={styles.h1nzd1pe}
    style={{
      flexDirection: props.width < 720 ? 'column' : 'row',
      height: props.height,
      transform: props.transform,
      width: props.width,
    }}
  >
    <Preview marginRight={props.width < 720 ? 20 : 0} />
    <Editor
      height={props.width < 720 ? props.height / 2 : props.height}
      width={props.width < 720 ? props.width : props.width - 300}
    />
    {props.children}
  </Animated.div>

export default App
// fonts {}
