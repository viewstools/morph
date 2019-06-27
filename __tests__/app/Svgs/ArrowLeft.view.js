// This file is auto-generated. Edit ArrowLeft.view to change it. More info: https://github.com/viewstools/docs/blob/master/UseViews/README.md#viewjs-is-auto-generated-and-shouldnt-be-edited
/* eslint-disable jsx-a11y/accessible-emoji, no-unused-vars, no-dupe-keys */
import React from 'react'
import { css } from 'emotion'

let styles = {}
styles.Svg = css({
  label: 'Svg',
  alignSelf: 'var(--alignSelf)',
  marginTop: 'var(--marginTop)',
  marginBottom: 'var(--marginBottom)',
  marginLeft: 'var(--marginLeft)',
  marginRight: 'var(--marginRight)',
  opacity: 'var(--opacity)',
  width: 'var(--width)',
  height: 'var(--height)',
})
styles.SvgPath = css({
  label: 'SvgPath',
  fill: 'var(--fill)',
  stroke: 'var(--stroke)',
})

let ArrowLeft = props => {
  return (
    <React.Fragment>
      <svg
        data-testid="ArrowLeft.Svg"
        viewBox="0 0 16 16"
        style={{
          '--alignSelf': props.alignSelf,
          '--marginTop':
            typeof props.marginTop === 'number'
              ? `${props.marginTop}px`
              : props.marginTop,
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
          '--opacity': props.opacity,
          '--width':
            typeof props.width === 'number' ? `${props.width}px` : props.width,
          '--height':
            typeof props.height === 'number'
              ? `${props.height}px`
              : props.height,
        }}
        className={`views-block ${styles.Svg}`}
      >
        <path
          data-testid="ArrowLeft.SvgPath"
          strokeWidth={2}
          strokeMiterlimit={10}
          d="M11.2 14.4L4.8 8l6.4-6.4"
          style={{ '--fill': props.fill, '--stroke': props.stroke }}
          className={`views-block ${styles.SvgPath}`}
        />
      </svg>
      {props.children}
    </React.Fragment>
  )
}
ArrowLeft.defaultProps = {
  alignSelf: 'auto',
  marginTop: 0,
  marginBottom: 0,
  marginLeft: 0,
  marginRight: 0,
  opacity: 1,
  width: 16,
  height: 16,
  fill: 'none',
  stroke: '#B5B5B5',
}
export default ArrowLeft
