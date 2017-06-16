export default ({ animatedA, animatedButton }) => {
  const ret = []

  if (animatedA) {
    ret.push(`Animated.a = Animated.createAnimatedComponent('a')`)
  }

  if (animatedButton) {
    ret.push(`Animated.button = Animated.createAnimatedComponent('button')`)
  }

  return ret.join('\n')
}
