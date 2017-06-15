import Mousetrap from 'mousetrap'
import React, { PureComponent, PropTypes } from 'react'

export default class Shortcut extends PureComponent {
  componentDidMount() {
    const { props } = this

    Mousetrap.bind(props.keys, e => {
      props.onPress(e)
      return false
    })
  }

  componentWillUnmount() {
    Mousetrap.unbind(this.props.keys)
  }

  render() {
    return null
  }
}
Shortcut.propTypes = {
  keys: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]).isRequired,
  onPress: PropTypes.func.isRequired,
}

export const trigger = Mousetrap.trigger.bind(Mousetrap)
