// This file is auto-generated. Edit ButtonIcon.view to change it. More info: https://github.com/viewstools/docs/blob/master/UseViews/README.md#viewjs-is-auto-generated-and-shouldnt-be-edited
/* eslint-disable jsx-a11y/accessible-emoji, no-unused-vars, no-dupe-keys */
import ArrowLeft from '../Svgs/ArrowLeft.view.js'
import React from 'react'
import { css } from 'emotion'

let styles = {}
styles.ButtonIcon1 = css({
  label: 'ButtonIcon1',
  flexDirection: 'row',
  alignItems: 'center',
  cursor: 'pointer',
  justifyContent: 'center',
  paddingBottom: 4,
  paddingLeft: 4,
  paddingRight: 4,
  paddingTop: 4,
  borderColor: '#ebebeb',
  borderStyle: 'solid',
  borderWidth: 1,
  borderBottomLeftRadius: 4,
  borderBottomRightRadius: 4,
  borderTopLeftRadius: 4,
  borderTopRightRadius: 4,
  userSelect: 'none',
  alignSelf: 'var(--alignSelf)',
  marginLeft: 'var(--marginLeft)',
})

let ButtonIcon = props => {
  return (
    <React.Fragment>
      <button
        data-testid="ButtonIcon.ButtonIcon"
        onClick={props.onClick}
        onMouseEnter={props.onMouseEnter}
        onMouseLeave={props.onMouseLeave}
        style={{
          '--alignSelf': props.alignSelf,
          '--marginLeft':
            typeof props.marginLeft === 'number'
              ? `${props.marginLeft}px`
              : props.marginLeft,
        }}
        className={`views-block ${styles.ButtonIcon1}`}
      >
        <props.proxyArrowLeft
          data-testid="ButtonIcon.ArrowLeft"
          proxy={true}
          width={15}
          height={15}
          stroke="#404040"
        />
      </button>
      {props.children}
    </React.Fragment>
  )
}
ButtonIcon.defaultProps = {
  alignSelf: 'auto',
  marginLeft: 0,
  proxyArrowLeft: ArrowLeft,
}
export default ButtonIcon
