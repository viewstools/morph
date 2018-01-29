export default ({ state, name }) => {
  if (state.track && !state.debug) {
    return `${name}.contextTypes = {
  track: PropTypes.func.isRequired
}`
  }

  return ''
}
