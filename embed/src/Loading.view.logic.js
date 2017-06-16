import View from './Loading.view.js'
import Animated from 'animated/lib/targets/react-dom'
import Easing from 'animated/lib/Easing'
import React from 'react'

Animated.inject.FlattenStyle(
  styles => (Array.isArray(styles) ? Object.assign.apply(null, styles) : styles)
)

console.log(Animated, Easing)

class LoadingLogic extends React.Component {
  state = {
    opacity1: new Animated.Value(1),
    opacity2: new Animated.Value(1),
    opacity3: new Animated.Value(1),

    translateY1: new Animated.Value(0),
    translateY2: new Animated.Value(0),
    translateY3: new Animated.Value(0),
  }

  loop = () => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(this.state.opacity1, {
          toValue: 0.5,
          duration: 250,
        }),
        Animated.timing(this.state.opacity2, {
          toValue: 0.5,
          duration: 250,
          delay: 100,
        }),
        Animated.timing(this.state.opacity3, {
          toValue: 0.5,
          duration: 250,
          delay: 150,
        }),

        Animated.timing(this.state.translateY1, {
          toValue: 20,
          duration: 250,
        }),
        Animated.timing(this.state.translateY2, {
          toValue: 20,
          duration: 250,
          delay: 100,
        }),
        Animated.timing(this.state.translateY3, {
          toValue: 20,
          duration: 250,
          delay: 150,
        }),
      ]),

      Animated.parallel([
        Animated.timing(this.state.opacity1, {
          toValue: 1,
          duration: 250,
        }),
        Animated.timing(this.state.opacity2, {
          toValue: 1,
          duration: 250,
          delay: 100,
        }),
        Animated.timing(this.state.opacity3, {
          toValue: 1,
          duration: 250,
          delay: 150,
        }),

        Animated.timing(this.state.translateY1, {
          toValue: 0,
          duration: 250,
        }),
        Animated.timing(this.state.translateY2, {
          toValue: 0,
          duration: 250,
          delay: 100,
        }),
        Animated.timing(this.state.translateY3, {
          toValue: 0,
          duration: 250,
          delay: 150,
        }),
      ]),
    ]).start(this.loop)
  }

  componentDidMount() {
    this.loop()
  }

  render() {
    const { state } = this
    return (
      <View>
        <Animated.div
          style={{
            backgroundColor: '#f7941e',
            borderRadius: 10,
            height: 10,
            width: 10,
            marginTop: state.translateY1,
            // transform: [{ translateY: state.translateY1 }],
            opacity: state.opacity1,
          }}
        />

        <Animated.div
          style={{
            backgroundColor: '#f7941e',
            borderRadius: 10,
            height: 10,
            marginLeft: 3,
            width: 10,
            marginTop: state.translateY2,
            // transform: [{ translateY: state.translateY2 }],
            opacity: state.opacity2,
          }}
        />

        <Animated.div
          style={{
            backgroundColor: '#f7941e',
            borderRadius: 10,
            height: 10,
            marginLeft: 3,
            width: 10,
            marginTop: state.translateY3,
            // transform: [{ translateY: state.translateY3 }],
            opacity: state.opacity3,
          }}
        />
      </View>
    )
  }
}

export default () => <LoadingLogic />
