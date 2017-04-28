import * as fromCode from './code.js'
import morphProps from './morph-props.js'

export default function* Text({ style, text }, { block, debug, indent, index }) {
  const accessed = []
  yield `${indent}<Text`
  const { accessed:accessedProps, hasProps } = yield* morphProps({ style }, { block, debug, indent: `${indent}  `, index })
  if (hasProps) {
    yield indent
    accessedProps.forEach(b => !accessed.includes(b) && accessed.push(b))
  }
  yield `>\n${indent}  `

  const startsWithCode = fromCode.START.test(text)
  const endsWithCode = fromCode.END.test(text)

  // escape a string that may look like code to React
  if ((startsWithCode && !endsWithCode) || (!startsWithCode && endsWithCode)) {
    yield `{\`${text}\`}`
  } else {
    const extractedCode = fromCode.extractCode(text)

    if (extractedCode) {
      yield '{'
      if (extractedCode.isValid) {
        const isImplicitInterpolation = /\${/.test(extractedCode.code) && !/`/.test(extractedCode.code)
        if (isImplicitInterpolation) yield '`'
        yield extractedCode.code
        if (isImplicitInterpolation) yield '`'
      } else {
        yield JSON.stringify(text)
      }
      yield '}'
    } else {
      yield text
    }
    if (extractedCode) {
      extractedCode.accessed.forEach(a => !accessed.includes(a) && accessed.push(a))
    }
  }

  yield `\n${indent}</Text>\n`

  return {
    accessed,
    captures: [],
    index: index + 1,
    uses: [
      'Text',
    ],
  }
}
