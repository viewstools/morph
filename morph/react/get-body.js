import { canUseNativeDriver } from '../utils.js'
import toPascalCase from 'to-pascal-case'

export default ({ state, name }) => {
  let render = state.render.join('')
  if (Object.keys(state.locals).length > 0 || state.isFormatted) {
    render = `<Subscribe to={[LocalContainer]}>\n{local =>\n${render}\n}</Subscribe>`
  }

  const maybeChildrenArray = state.usesChildrenArray
    ? `const childrenArray = React.Children.toArray(props.children)`
    : ''

  const maybeState =
    state.captures.length > 0
      ? `constructor(props) {
    super(props)
    this.state = {}
  }`
      : ''

  const maybeTracking = state.track && !state.debug

  const composeAnimation = (state, animation, index) => {
    if (animation.curve === 'spring') {
      return composeSpring(animation, index)
    } else if (state.isReactNative) {
      return composeTiming(animation, index)
    }
  }

  const composeSpring = (animation, index) =>
    `if (props.${animation.scope} !== prev.${animation.scope}) {
      Animated.spring(this.animatedValue${index}, {
        toValue: props.${animation.scope} ? 1 : 0,
        speed: ${animation.speed},
        bounciness: ${animation.bounciness},
        delay: ${animation.delay},
        useNativeDriver: ${canUseNativeDriver(animation)}
      }).start()
    }`

  const composeTiming = (animation, index) =>
    `if (props.${animation.scope} !== prev.${animation.scope}) {
      Animated.timing(this.animatedValue${index}, {
        toValue: props.${animation.scope} ? 1 : 0,
        duration: ${animation.duration},
        delay: ${animation.delay},
        useNativeDriver: ${canUseNativeDriver(animation)}
      }).start()
    }`

  const composeValues = (state, animation, index) => {
    if (animation.curve === 'timing' && !state.isReactNative) return
    return `animatedValue${index} = new Animated.Value(this.props.${
      animation.scope
    } ? 1 : 0)
    `
  }

  let maybeAnimated = false
  let animatedOpen = []
  let animatedClose = []
  if (state.isAnimated || state.hasAnimatedChild) {
    maybeAnimated = true

    Object.keys(state.animations).forEach(blockId => {
      const blockAnimations = {}
      state.animations[blockId].forEach(item => {
        if (!state.isReactNative && item.curve !== 'spring') return

        if (!blockAnimations[item.id]) {
          blockAnimations[item.id] = {
            animation: item,
            props: {
              [item.name]: {
                name: item.name,
                scopes: [],
                value: item.baseValue,
              },
            },
          }
        }

        blockAnimations[item.id].props[item.name].scopes.push({
          name: item.scope,
          value: item.value,
        })
      })

      Object.entries(blockAnimations).forEach(([id, item]) => {
        const tag = `Animated${toPascalCase(item.animation.curve)}Component`
        // TODO do this somewhere else
        const config =
          item.animation.curve === 'spring'
            ? `{ bounciness: ${item.animation.bounciness}, speed: ${
                item.animation.speed
              } }`
            : `{ duration: ${item.animation.duration} }`

        const to = Object.entries(item.props)
          .map(([_, prop]) => {
            prop.scopes.reverse()
            return `${JSON.stringify(prop.name)}: ${prop.scopes.reduce(
              (current, scope) =>
                `props.${scope.name}? ${JSON.stringify(
                  scope.value
                )} : ${current}`,
              JSON.stringify(prop.value)
            )} `
          })
          .join(',\n')

        animatedOpen.push(
          `<${tag} config={${config}} delay={${
            item.animation.delay
          }} to={{${to}}}>{animated${blockId} => (`
        )

        animatedClose.push(`)}</${tag}>`)
      })
    })
  }

  if (maybeState || maybeTracking || maybeAnimated) {
    return `class ${name} extends React.Component {
  ${maybeState}

  render() {
    const { ${maybeTracking ? 'context,' : ''} props, ${
      maybeState ? 'state' : ''
    } } = this
    ${maybeChildrenArray}
    return (${animatedOpen.join('')}${render}${animatedClose.join('')})
  }
}`
  } else {
    return `const ${name} = (props ${maybeTracking ? ', context' : ''}) => {
  ${maybeChildrenArray}
  return (${render})
}`
  }
}
