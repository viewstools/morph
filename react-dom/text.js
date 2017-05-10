import * as fromCode from './code.js'
import morphProps from './morph-props.js'

export default function* Text(
  { blockIs, key, style, text },
  { block, debug, index }
) {
  const accessed = []
  yield `<div`
  const { accessed: accessedProps, hasProps, uses } = yield* morphProps(
    { blockIs, key, style },
    { block, debug, index }
  )
  if (hasProps) {
    accessedProps.forEach(b => !accessed.includes(b) && accessed.push(b))
  }
  yield `>\n`

  const startsWithCode = fromCode.START.test(text)
  const endsWithCode = fromCode.END.test(text)

  // escape a string that may look like code to React
  if ((startsWithCode && !endsWithCode) || (!startsWithCode && endsWithCode)) {
    yield `{\`${text}\`}`
  } else {
    const extractedCode = fromCode.extractCode(text)
    if (extractedCode) {
      yield '{'

      // implicit interpolation
      if (/\${/.test(extractedCode.code) && !/`/.test(extractedCode.code)) {
        yield '`'
        yield extractedCode.codeRaw
        yield '`'
      } else {
        yield extractedCode.code
      }

      yield '}'

      extractedCode.accessed.forEach(
        a => !accessed.includes(a) && accessed.push(a)
      )
    } else {
      yield typeof text === 'string' ? text : ''
    }
  }

  yield `\n</div>\n`

  return {
    accessed,
    index: index + 1,
    uses,
  }
}
