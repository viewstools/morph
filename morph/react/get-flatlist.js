export default (state, name) => {
  return state.uses.includes('Animated') && state.uses.includes('FlatList')
    ? `const AnimatedFlatList = Animated.createAnimatedComponent(FlatList)`
    : ''
}
