import getStyle from './get-style.js'
import PropTypes from 'prop-types'
import React from 'react'
import { Link } from 'react-router-dom'

const TRAILING_SLASH = /\/$/
const withTrailingSlash = path => (
  TRAILING_SLASH.test(path)? path : `${path}/`
)

export default class Teleport extends React.Component {
  constructor(props) {
    super(props)
    this.state = getStyle(props)
  }

  render() {
    const { props, state } = this
    const { route } = this.context.router

    const to = `${withTrailingSlash(route.match.url)}${props.to}`
    const isActive = props.isActive || route.location.pathname === to

    return props.to ? (
      <Link
        className={isActive ? `${state.className} active` : state.className}
        to={to}
        onClick={props.onClick}
      >
        {state.style}
        {props.children}
      </Link>
    ) : (
      <div
        className={state.className}
      >
        {state.style}
        {props.children}
      </div>
    )
  }
}

Teleport.contextTypes = {
  router: PropTypes.object.isRequired
}

Teleport.propTypes = {
  isActive: PropTypes.bool,
  onClick: PropTypes.func,
  style: PropTypes.object,
  styleActive: PropTypes.object,
  styleActiveHover: PropTypes.object,
  styleHover: PropTypes.object,
}
