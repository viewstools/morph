import { extractCode, hasCode } from './code.js'
import { FILL, STROKE } from '../blocking-styles.js'

export default function* morphObject(props, { block, indent }) {
  const accessed = []
  const keys = Object.keys(props)
  let internalIndent = `${indent}  `

  yield `{\n`

  for (let i=0; i < keys.length; i++) {
    const prop = keys[i]
    const value = props[prop]

    if (prop === 'heightBlocked') {
      yield `backgroundColor: '${FILL[block]}',
border: '2px solid ${STROKE[block]}',
borderRadius: 3,
height: ${value},
flex: 1`
    } else {
      yield `${internalIndent}${prop}`
      if (prop !== 'apply') {
        yield `: `
      }

      if (typeof value === 'string') {
        if (hasCode(value)) {
          const { accessed:accessedValue, code:codeValue } = extractCode(value)
          accessedValue.forEach(a => !accessed.includes(a) && accessed.push(a))
          yield codeValue
        } else {
          const maybeNumber = parseFloat(value, 10)
          if (!isNaN(maybeNumber) && maybeNumber == value) {
            yield maybeNumber
          } else {
            yield JSON.stringify(value)
          }
        }
      } else if (typeof value === 'number' || typeof value === 'boolean' || value === null || typeof value === 'undefined') {
        yield value
      } else {
        yield* morphObject(value[i], { block, indent: `${internalIndent}  ` })
      }
    }

    if (i < keys.length - 1) {
      yield ',\n'
    }
  }

  yield `\n${indent}}`

  return {
    accessed,
  }
}
