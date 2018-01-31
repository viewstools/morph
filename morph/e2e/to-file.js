export default ({ name, state }) => {
  const render = state.render.sort().join('')

  return ` const { get } = require("@viewstools/e2e");

  module.exports = {
    ${render}
  };`
}
