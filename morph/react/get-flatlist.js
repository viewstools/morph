export default ({ uses }) => {
  return uses.includes('Animated') && uses.includes('FlatList')
    ? `const AnimatedFlatList = Animated.createAnimatedComponent(FlatList)`
    : ''
}
