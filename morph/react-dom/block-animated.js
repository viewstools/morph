export const enter = (node, parent, state) => {
  if (node.name.finalValue === 'Animated.a') {
    state.animatedA = true
  }

  if (node.name.finalValue === 'Animated.button') {
    state.animatedButton = true
  }
}
