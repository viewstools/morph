import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router-native'
import { View } from 'react-native'

const TRAILING_SLASH = /\/$/
const withTrailingSlash = path => (
  TRAILING_SLASH.test(path)? path : `${path}/`
)

export default class Teleport extends React.Component {
  static contextTypes = {
    router: PropTypes.object.isRequired
  }

  static propTypes = {
    isActive: PropTypes.bool,
    onPress: PropTypes.func,
    style: PropTypes.object,
    styleActive: PropTypes.object,
    styleActiveHover: PropTypes.object,
    styleHover: PropTypes.object,
  }

  render() {
    const { context, props, state } = this

    const to = `${withTrailingSlash(context.router.match.url)}${props.to}`
    const isActive = props.isActive || context.router.location.pathname === to

    const style = [
      props.style
    ]

    let underlayColor = 'transparent'
    if (props.styleHover) {
      underlayColor = props.styleHover.backgroundColor || props.styleHover.color
    }

    if (isActive) {
      style.push(props.styleActive)

      if (props.styleActiveHover) {
        underlayColor = props.styleHover.backgroundColor || props.styleHover.color
      }
    }

    return props.to ? (
      <Link
        onPress={props.onPress}
        style={style}
        to={to}
        underlayColor={underlayColor}
      >
        <View>{props.children}</View>
      </Link>
    ) : (
      <View
        style={prop.style}
      >
        {props.children}
      </View>
    )
  }
}
