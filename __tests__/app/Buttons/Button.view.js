// This file is auto-generated. Edit Button.view to change it. More info: https://github.com/viewstools/docs/blob/master/UseViews/README.md#viewjs-is-auto-generated-and-shouldnt-be-edited
/* eslint-disable jsx-a11y/accessible-emoji, no-unused-vars, no-dupe-keys */
import '../Fonts/Montserrat-400.js'
import React from 'react'
import { animated, useSpring } from 'react-spring'
import { css } from 'emotion'

let styles = {}
styles.Vertical = css({
  label: 'Vertical',
  opacity: 1,
  paddingBottom: 12,
  paddingLeft: 8,
  paddingRight: 8,
  paddingTop: 12,
  userSelect: 'none',
  '&:hover:enabled': {
    backgroundColor: '#ff8300',
    opacity: 0.85,
  },
  '&:focus:enabled': {
    backgroundColor: '#ffff00',
  },
  '&:disabled': {
    opacity: 0.2,
  },
  transition: 'opacity 75ms ease-out',
  willChange: 'background-color, opacity',
  alignSelf: 'var(--alignSelf)',
  backgroundColor: 'var(--backgroundColor)',
  marginLeft: 'var(--marginLeft)',
})
styles.Text = css({
  label: 'Text',
  color: '#ffffff',
  fontFamily: 'Montserrat, sans-serif',
  fontWeight: 400,
  fontSize: 12,
  [`.${styles.Vertical}:hover:enabled &`]: {
    color: '#323232',
  },
  [`.${styles.Vertical}:focus:enabled &`]: {
    color: '#323232',
  },
})

let Button = props => {
  let animatedVertical = useSpring({
    config: {
      tension: 170,
      friction: 26,
    },
    from: { backgroundColor: '#ff8383' },
    to: { backgroundColor: props.isSelected ? '#ff8383' : '#323232' },
  })

  return (
    <React.Fragment>
      <animated.button
        data-testid="Button.Vertical"
        disabled={props.isDisabled}
        onClick={props.onClick}
        style={{
          '--backgroundColor': animatedVertical.backgroundColor,
          '--alignSelf': props.alignSelf,
          '--marginLeft':
            typeof props.marginLeft === 'number'
              ? `${props.marginLeft}px`
              : props.marginLeft,
        }}
        className={`views-block ${styles.Vertical}`}
      >
        <span data-testid="Button.Text" className={`views-text ${styles.Text}`}>
          {props.text}
        </span>
      </animated.button>
      {props.children}
    </React.Fragment>
  )
}
Button.defaultProps = { alignSelf: 'auto', marginLeft: 0, text: 'label' }
export default Button
