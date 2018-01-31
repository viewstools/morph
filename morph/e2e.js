import * as visitor from './e2e/block.js'
import toFile from './e2e/to-file.js'
import walk from './walk.js'

export default ({ name, viewsParsed }) => {
  const state = {
    name,
    render: [],
    testIds: {},
    viewsParsed,
  }
  const parsed = viewsParsed[name]
  walk(parsed.views[0], visitor, state)

  return {
    code: toFile({
      name,
      state,
    }),
  }
}
