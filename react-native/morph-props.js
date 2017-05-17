import { extractCode, hasCode } from './code.js'
import morphObject from './morph-object.js'
import SVG from '../svg.js'
// import transformStyles from './transform-styles.js'

const IS_BLOCK = /^[A-Z][a-zA-Z0-9]+$/
const isBlock = s => IS_BLOCK.test(s)

const canPropBeProxied = p => p !== 'text' && p !== 'blockIs'

export default function* morphProps(rawProps, { block, debug, index }) {
  const accessed = []
  const captures = []
  const props = {}
  const uses = []

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
      uses,
    }
  }

  if (props.onClick && SVG.includes(block)) {
    props.onPress = props.onClick
    delete props.onClick
    props.onResponderMove = `{() => false}`
  }

  yield '\n'

  for (const prop in props) {
    const value = props[prop]

    // TODO should we remove apply?
    if (prop === 'apply') {
      const merge = Array.isArray(value) ? value : [value]
      for (let i = 0; i < merge.length; i++) {
        const mValue = merge[i]

        if (typeof mValue === 'string' && hasCode(mValue)) {
          const { accessed: accessedMValue, code: codeMValue } = extractCode(
            mValue
          )
          accessedMValue.forEach(a => !accessed.includes(a) && accessed.push(a))
          yield `{...${codeMValue}}`

          if (i < merge.length - 1) {
            yield '\n'
          }
        }
      }
    } else {
      // TODO support data attrs?
      yield prop === 'blockIs' ? 'data-block-name=' : `${prop}=`

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
              if (canPropBeProxied(prop) && isBlock(value)) {
                uses.push(value)
                yield `{${value}}`
              } else {
                yield JSON.stringify(value)
              }
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
        const res = yield* morphObject(
          value,
          // /^style/.test(prop) ? transformStyles(value) : value,
          { block }
        )
        res.accessed.forEach(b => !accessed.includes(b) && accessed.push(b))
        yield '}'
      }
    }

    yield '\n'
  }

  return {
    accessed,
    captures,
    hasProps: true,
    uses,
  }
}
