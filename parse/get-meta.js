import { getCodeData, getColor, isCode, isColor } from './helpers.js'
import getLoc from './get-loc.js'

// TODO rework this, if anything, we need a simpler data structure
// not an AST
export default (value, line, startLine) => {
  const hasCode = isCode(value)
  const hasColor = isColor(value)

  if (!(hasCode || hasColor)) return null

  const ret = {
    type: 'ArrayExpression',
    elements: [],
    loc: getLoc(startLine, 0, line.length - 1),
  }

  const add = tag => value => {
    const column = line.indexOf(value)
    ret.elements.push({
      type: 'Literal',
      loc: getLoc(startLine, column, column + value.length - 1),
      tag,
      value,
    })
  }

  if (hasCode) {
    getCodeData(value).forEach(add('code'))
  }
  if (hasColor) {
    getColor(value).forEach(add('color'))
  }

  return ret
}
