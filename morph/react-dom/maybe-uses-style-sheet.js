export default state => {
  if (Object.keys(state.styles).length > 0) {
    state.uses.push('glam')
  }
}
