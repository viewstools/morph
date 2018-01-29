import * as visitor from './e2e/block.js'
import parse from '../parse/index.js'
import toFile from './e2e/to-file.js'
import walk from './walk.js'

export default ({ file, name, view }) => {
  const state = {
    name,
    render: [],
    testIds: {},
  }

  const parsed = parse(view)
  walk(parsed.views[0], visitor, state)

  return {
    code: toFile({
      name,
      state,
    }),
  }
}
