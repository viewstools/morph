export default state => {
  if (state.hasAnimatedChild || state.isAnimated) {
    state.uses.push('Animated')
  }
}
