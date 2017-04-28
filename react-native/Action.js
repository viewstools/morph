import { TouchableHighlight, View } from 'react-native'
import React, { Component, PropTypes } from 'react'

export default class Action extends Component {
  render() {
    const { props, state } = this

    const style = [
      props.style
    ]

    let underlayColor = 'transparent'
    if (props.styleHover) {
      underlayColor = props.styleHover.backgroundColor || props.styleHover.color
    }

    if (props.isActive) {
      style.push(props.styleActive)

      if (props.styleActiveHover) {
        underlayColor = props.styleHover.backgroundColor || props.styleHover.color
      }
    }

    return (
      <TouchableHighlight
        onPress={props.onPress}
        style={style}
        underlayColor={underlayColor}
      >
        <View>{props.children}</View>
      </TouchableHighlight>
    )
  }
}
Action.propTypes = {
  isActive: PropTypes.bool,
  onPress: PropTypes.func.isRequired,
  style: PropTypes.object,
  styleActive: PropTypes.object,
  styleActiveHover: PropTypes.object,
  styleHover: PropTypes.object,
}
