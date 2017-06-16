import { onView } from './view.js'
import Loading from './Loading.view.logic.js'
import React from 'react'
import View from './Preview.view.js'

export default class PreviewLogic extends React.Component {
  state = {
    view: Loading,
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
