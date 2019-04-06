export default ({ uses }) => {
  return uses.includes('Animated') && uses.includes('FlatList')
    ? `let AnimatedFlatList = Animated.createAnimatedComponent(FlatList)`
    : ''
}
