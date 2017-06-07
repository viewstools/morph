export default state => {
  if (state.uses.includes('Router')) {
    state.render = ['<Router>', ...state.render, '</Router>']
  }
}
