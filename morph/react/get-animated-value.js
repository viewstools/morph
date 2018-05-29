export default ({ hasAnimatedChild, isAnimated }) =>
  hasAnimatedChild || isAnimated
    ? `const getAnimatedValue = (animatedValue, from, to) =>
    animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [from, to],
    })`
    : ''
