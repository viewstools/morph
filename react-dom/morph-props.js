import { extractCode, hasCode } from './code.js'
import morphObject from './morph-object.js'

export default function* morphProps(rawProps, { block, debug, indent, index }) {
  const accessed = []
  const props = {}

  Object.keys(rawProps).forEach(key => {
    if (typeof rawProps[key] !== 'undefined') {
      props[key] = rawProps[key]
    }
  })

  if (debug) {
    if (props.onClick) {
      const { accessed: accessedOnClick, code: codeOnClick } = extractCode(
        props.onClick
      )
      accessedOnClick.forEach(a => !accessed.includes(a) && accessed.push(a))

      props.onClick = `{e => { props._select(e, ${index}); props._transitionTo(e, ${codeOnClick}) }}`
    } else {
      props.onClick = `{e => props._select(e, ${index})}`
    }
  }

  if (Object.keys(props).length === 0) {
    return {
      accessed,
      hasProps: false,
    }
  }

  yield '\n'

  for (const prop in props) {
    const value = props[prop]

    if (prop === 'apply') {
      const merge = Array.isArray(value) ? value : [value]
      for (let i = 0; i < merge.length; i++) {
        const mValue = merge[i]

        if (typeof mValue === 'string' && hasCode(mValue)) {
          const { accessed: accessedMValue, code: codeMValue } = extractCode(
            mValue
          )
          accessedMValue.forEach(a => !accessed.includes(a) && accessed.push(a))
          yield `${indent}{...${codeMValue}}`

          if (i < merge.length - 1) {
            yield '\n'
          }
        }
      }
      // TODO support data attrs and blockName
    } else {
      yield `${indent}${prop}=`

      if (typeof value === 'string') {
        if (prop === 'onClick' && debug) {
          yield value
        } else {
          const extractedCode = extractCode(value)
          if (hasCode(value)) {
            yield '{'
            // implicit interpolation
            if (
              /\${/.test(extractedCode.code) &&
              !/`/.test(extractedCode.code)
            ) {
              yield '`'
              yield extractedCode.codeRaw
              yield '`'
            } else {
              yield extractedCode.code
            }
            yield '}'
          } else {
            const maybeNumber = parseFloat(value, 10)
            if (!isNaN(maybeNumber) && maybeNumber == value) {
              yield `{${maybeNumber}}`
            } else {
              yield JSON.stringify(value)
            }
          }
        }
      } else if (
        typeof value === 'number' ||
        typeof value === 'boolean' ||
        value === null
      ) {
        yield `{${value}}`
      } else {
        yield '{'
        const res = yield* morphObject(value, { block, indent })
        res.accessed.forEach(b => !accessed.includes(b) && accessed.push(b))
        yield '}'
      }
    }

    yield '\n'
  }

  return {
    accessed,
    hasProps: true,
  }
}
