import Animated, {
  timing,
  sequence,
  parallel,
  Value,
} from 'animated/lib/targets/react-dom.js'
import React from 'react'
import View from './Loading.view.js'

Animated.inject.FlattenStyle(
  styles => (Array.isArray(styles) ? Object.assign.apply(null, styles) : styles)
)

class LoadingLogic extends React.Component {
  state = {
    opacity1: new Value(1),
    opacity2: new Value(1),
    opacity3: new Value(1),

    translateY1: new Value(0),
    translateY2: new Value(0),
    translateY3: new Value(0),
  }

  loop = () => {
    sequence([
      parallel([
        timing(this.state.opacity1, {
          toValue: 0.5,
          duration: 300,
        }),
        timing(this.state.opacity2, {
          toValue: 0.5,
          duration: 300,
          delay: 100,
        }),
        timing(this.state.opacity3, {
          toValue: 0.5,
          duration: 300,
          delay: 150,
        }),

        timing(this.state.translateY1, {
          toValue: 10,
          duration: 300,
        }),
        timing(this.state.translateY2, {
          toValue: 10,
          duration: 300,
          delay: 100,
        }),
        timing(this.state.translateY3, {
          toValue: 10,
          duration: 300,
          delay: 150,
        }),
      ]),

      parallel([
        timing(this.state.opacity1, {
          toValue: 1,
          duration: 300,
        }),
        timing(this.state.opacity2, {
          toValue: 1,
          duration: 300,
          delay: 100,
        }),
        timing(this.state.opacity3, {
          toValue: 1,
          duration: 300,
          delay: 150,
        }),

        timing(this.state.translateY1, {
          toValue: 0,
          duration: 300,
        }),
        timing(this.state.translateY2, {
          toValue: 0,
          duration: 300,
          delay: 100,
        }),
        timing(this.state.translateY3, {
          toValue: 0,
          duration: 300,
          delay: 150,
        }),
      ]),
    ]).start(this.loop)
  }

  componentDidMount() {
    this.loop()
  }

  getAnimated() {
    const {
      opacity1,
      opacity2,
      opacity3,
      translateY1,
      translateY2,
      translateY3,
    } = this.state

    const interpolate = {
      inputRange: [0, 10],
      outputRange: ['0px', '10px'],
    }

    return {
      opacity1,
      opacity2,
      opacity3,
      transform1: [
        {
          translateY: translateY1.interpolate(interpolate),
        },
      ],
      transform2: [
        {
          translateY: translateY2.interpolate(interpolate),
        },
      ],
      transform3: [
        {
          translateY: translateY3.interpolate(interpolate),
        },
      ],
    }
  }

  render() {
    return <View {...this.getAnimated()} />
  }
}

export default () => <LoadingLogic />
