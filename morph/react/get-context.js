// TODO we may be better off using withRouter from react-router
export default ({ state, name }) =>
  state.usesRouterContext &&
  `${name}.contexTypes = { router: PropTypes.object }`
