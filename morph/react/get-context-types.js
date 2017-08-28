export default ({ state, name }) =>
  `${name}.contextTypes = {
  selectBlock: PropTypes.func.isRequired,
  hoverBlock: PropTypes.func.isRequired,
}`
