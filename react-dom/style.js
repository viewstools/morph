import { extractCode, hasCode } from './code.js'

// TODO remove. It is an escape hatch at the end...
// TODO onClick for debug
export default function* Style({ css }, { index }) {
  let accessed = []

  yield `<style>\n`

  if (hasCode(css)) {
    yield css
    accessed = extractCode(css).accessed
  } else {
    yield `{\`${css}\`}`
  }
  yield `\n</style>\n`

  return {
    accessed,
    index: index + 1,
    uses: [],
  }
}
