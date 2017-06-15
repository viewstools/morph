import { onView } from './view.js'
import React from 'react'
import View from './Preview.view.js'

export default class Preview extends React.Component {
  state = {
    view: () => {},
  }

  componentDidMount() {
    onView(view => {
      this.setState({
        view,
      })
    })
  }

  render() {
    return (
      <View {...this.props}>
        {this.state.view({})}
      </View>
    )
  }
}
