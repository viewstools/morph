export default ({ state, name }) => {
  if (state.track) {
    return `${name}.contextTypes = {
  track: PropTypes.func.isRequired
}`
  }

  return ''
}
