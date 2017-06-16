/* eslint-disable jsx-a11y/accessible-emoji */
import React from 'react'
import Animated from 'animated/lib/targets/react-dom.js'
import './Preview.view.css'
const styles = { h1d6giad: 'css-akv4zc' }

const Preview = props =>
  <Animated.div
    className={styles.h1d6giad}
    style={{ marginRight: props.marginRight }}
  >
    {props.children}
  </Animated.div>

export default Preview
// fonts {}
