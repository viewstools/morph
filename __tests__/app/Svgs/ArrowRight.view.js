// This file is auto-generated. Edit ArrowRight.view to change it. More info: https://github.com/viewstools/docs/blob/master/UseViews/README.md#viewjs-is-auto-generated-and-shouldnt-be-edited
/* eslint-disable jsx-a11y/accessible-emoji, no-unused-vars, no-dupe-keys */
import React from 'react'
import { css } from 'emotion'

let styles = {}
styles.ArrowRight1 = css({
  label: 'ArrowRight1',
  alignSelf: 'var(--alignSelf)',
  height: 'var(--height)',
  marginBottom: 'var(--marginBottom)',
  marginLeft: 'var(--marginLeft)',
  marginRight: 'var(--marginRight)',
  marginTop: 'var(--marginTop)',
  opacity: 'var(--opacity)',
  width: 'var(--width)',
})
styles.SvgPath = css({
  label: 'SvgPath',
  fill: 'var(--fill)',
  stroke: 'var(--stroke)',
})

let ArrowRight = props => {
  return (
    <React.Fragment>
      <svg
        data-testid="ArrowRight.ArrowRight"
        viewBox="0 0 16 16"
        style={{
          '--alignSelf': props.alignSelf,
          '--height':
            typeof props.height === 'number'
              ? `${props.height}px`
              : props.height,
          '--marginBottom':
            typeof props.marginBottom === 'number'
              ? `${props.marginBottom}px`
              : props.marginBottom,
          '--marginLeft':
            typeof props.marginLeft === 'number'
              ? `${props.marginLeft}px`
              : props.marginLeft,
          '--marginRight':
            typeof props.marginRight === 'number'
              ? `${props.marginRight}px`
              : props.marginRight,
          '--marginTop':
            typeof props.marginTop === 'number'
              ? `${props.marginTop}px`
              : props.marginTop,
          '--opacity': props.opacity,
          '--width':
            typeof props.width === 'number' ? `${props.width}px` : props.width,
        }}
        className={`views-block ${styles.ArrowRight1}`}
      >
        <path
          data-testid="ArrowRight.SvgPath"
          d="M4.8 1.6L11.2 8l-6.4 6.4"
          strokeMiterlimit={10}
          strokeWidth={2}
          style={{ '--fill': props.fill, '--stroke': props.stroke }}
          className={`views-block ${styles.SvgPath}`}
        />
      </svg>
      {props.children}
    </React.Fragment>
  )
}
ArrowRight.defaultProps = {
  alignSelf: 'auto',
  height: 16,
  marginBottom: 0,
  marginLeft: 0,
  marginRight: 0,
  marginTop: 0,
  opacity: 1,
  width: 16,
  fill: 'none',
  stroke: '#B5B5B5',
}
export default ArrowRight
