import { extractCode, hasCode } from './code.js'
import { FILL, STROKE } from '../blocking-styles.js'

const AVOID = [
  'fontFamily',
  'fontWeight',
  'filter',
  // 'fontSize',
  'cursor',
  'overflowX',
  'overflowY',
  'transition',

  'auto',
]

const SWAP = {
  borderBottomStyle: 'borderStyle',
  borderLeftStyle: 'borderStyle',
  borderRightStyle: 'borderStyle',
  borderTopStyle: 'borderStyle',
}

export default function* morphObject(props, { block }) {
  const accessed = []
  const keys = Object.keys(props)

  yield `{\n`

  for (let i = 0; i < keys.length; i++) {
    let prop = keys[i]
    let value = props[prop]

    if (AVOID.includes(prop) || AVOID.includes(value)) continue

    if (SWAP[prop]) {
      prop = SWAP[prop]
    }

    if (prop === 'fontFamily') {
      value = value.split(',')[0].replace(/\s/g, '')
      if (props.fontWeight) {
        value = `${value}-${props.fontWeight}`
      }
    }

    if (prop === 'heightBlocked') {
      yield `backgroundColor: '${FILL[block]}',
border: '2px solid ${STROKE[block]}',
borderRadius: 3,
height: ${value},
flex: 1`
    } else {
      yield `${prop}`
      if (prop !== 'apply') {
        yield `: `
      }

      if (typeof value === 'string') {
        if (hasCode(value)) {
          const {
            accessed: accessedValue,
            code: codeValue,
            codeRaw,
          } = extractCode(value)
          accessedValue.forEach(a => !accessed.includes(a) && accessed.push(a))
          // implicit interpolation
          if (/\${/.test(codeValue) && !/`/.test(codeValue)) {
            yield '`'
            yield codeRaw
            yield '`'
          } else {
            yield codeValue
          }
        } else {
          // support vh/vw, assumes your view passes props.height and props.width
          if (/^[0-9]+(vh|vw)$/.test(value)) {
            const number = parseInt(value, 10)
            const dimension = /vh/.test(value) ? 'height' : 'width'
            yield '`'
            yield `${number} * props.${dimension} / 100`
            yield '`'
          } else {
            const isNumber = /%/.test(value) || /^[0-9\-]+$/.test(value)
            // console.log('prop', prop, 'isNumber', isNumber)
            yield isNumber ? parseInt(value, 10) : JSON.stringify(value)
          }
        }
      } else if (
        typeof value === 'number' ||
        typeof value === 'boolean' ||
        value === null ||
        typeof value === 'undefined'
      ) {
        // yield value
        // console.log('prop nubmer', prop)
        yield prop === 'fontWeight' ? `"${value}"` : value
      } else {
        yield* morphObject(value[i], { block })
      }
    }

    if (i < keys.length - 1) {
      yield ',\n'
    }
  }

  yield `\n}`

  return {
    accessed,
  }
}
