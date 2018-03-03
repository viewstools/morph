export default ({ hasAnimatedChild }) =>
  hasAnimatedChild
    ? `const getAnimatedValue = (animatedValue, from, to) =>
    animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [from, to],
    })`
    : ''
