export default (fn, prop) =>
  `${fn} = () => this.setState({ ${prop}: !this.state.${prop} })`
