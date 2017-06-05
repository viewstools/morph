export default ({ state, name }) =>
  state.defaultProps ? `${name}.defaultProps = ${state.defaultProps}` : ''
