import getStyle from './get-style.js'
import PropTypes from 'prop-types'
import React from 'react'

export default class Action extends React.Component {
  constructor(props) {
    super(props)
    this.state = getStyle(props)
  }

  componentWillReceiveProps(nextProps) {
    this.setState(getStyle(nextProps))
  }

  render() {
    const { props, state } = this

    return (
      <button
        className={props.isActive ? `${state.className} active` : state.className}
        onClick={props.onClick}
      >
        {state.style}
        {props.children}
      </button>
    )
  }
}
Action.propTypes = {
  isActive: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  style: PropTypes.object,
  styleActive: PropTypes.object,
  styleActiveHover: PropTypes.object,
  styleHover: PropTypes.object,
}
