/* eslint-disable jsx-a11y/accessible-emoji */
import React from 'react'
import Animated from 'animated/lib/targets/react-dom.js'
import './Loading.view.css'
const styles = {
  hmh9g24: 'css-1ijnn3w',
  hwp2llb: 'css-dtparm',
  h1thkoov: 'css-109yuia',
}

const Loading = props =>
  <div className={styles.hmh9g24}>
    <Animated.div
      className={styles.hwp2llb}
      style={{ opacity: props.opacity1, transform: props.transform1 }}
    />
    <Animated.div
      className={styles.h1thkoov}
      style={{ opacity: props.opacity2, transform: props.transform2 }}
    />
    <Animated.div
      className={styles.h1thkoov}
      style={{ opacity: props.opacity3, transform: props.transform3 }}
    />
    {props.children}
  </div>

export default Loading
// fonts {}
