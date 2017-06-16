import debounce from 'debounce'
import React from 'react'

const getDimensions = () => ({
  width: window.innerWidth,
  height: window.innerHeight,
})

export default class Dimensions extends React.Component {
  state = getDimensions()

  onResize = debounce(() => {
    this.setState(getDimensions())
  }, 25)

  componentWillMount() {
    window.addEventListener('resize', this.onResize, false)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize, false)
  }

  render() {
    return this.props.children(this.state)
  }
}
