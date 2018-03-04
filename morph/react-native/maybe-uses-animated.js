export default state => {
  if (state.hasAnimatedChild) {
    state.uses.push('Animated')
  }
}
