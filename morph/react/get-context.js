export default ({ state, name }) => {
  if (!state.track) return ''

  return `${name}.contextTypes = {
    track: PropTypes.func.isRequired
  }`
}
