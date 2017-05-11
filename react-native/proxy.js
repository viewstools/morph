import { extractCode } from './code.js'
import morphProps from './morph-props.js'

export default function*({ from, ...rest }, { index }) {
  const accessed = []

  const { accessed: accessedFrom, code: codeFrom } = extractCode(from)
  accessedFrom.forEach(a => !accessed.includes(a) && accessed.push(a))

  yield `<${codeFrom}`

  const { accessed: accessedProps, hasProps, uses } = yield* morphProps(rest, {
    block: 'Proxy',
    index,
  })
  accessedProps.forEach(b => !accessed.includes(b) && accessed.push(b))

  yield '/>\n'

  return {
    accessed,
    index: index + 1,
    uses,
  }
}
