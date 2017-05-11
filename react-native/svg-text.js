import * as fromCode from './code.js'
import morphProps from './morph-props.js'

export default function* SvgText(
  { text, ...props },
  { block, custom, debug, index }
) {
  const accessed = []
  yield `<SvgText`
  const { accessed: accessedProps, hasProps } = yield* morphProps(props, {
    block,
    debug,
    index,
  })
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

    if (debug) {
      // TODO if value is array, it shouldn't fail
      if (extractedCode && extractedCode.code === 'props') {
        yield 'props'
      } else if (extractedCode) {
        yield '{'
        // implicit interpolation
        if (/\${/.test(extractedCode.code) && !/`/.test(extractedCode.code)) {
          yield '`'
          yield extractedCode.codeRaw
          yield '`'
        } else {
          if (extractedCode.isValid) {
            yield `typeof ${extractedCode.code} === 'string' ? ${extractedCode.code} : JSON.stringify(${extractedCode.code})`
          } else {
            yield JSON.stringify(text)
          }
        }
        yield '}'
      } else {
        yield typeof text === 'string' ? text : ''
      }
    } else {
      // implicit interpolation
      if (/\${/.test(extractedCode.code) && !/`/.test(extractedCode.code)) {
        yield '{`'
        yield extractedCode.codeRaw
        yield '`}'
      } else {
        yield typeof text === 'string' ? text : ''
      }
    }
    if (extractedCode) {
      extractedCode.accessed.forEach(
        a => !accessed.includes(a) && accessed.push(a)
      )
    }
  }

  yield `\n</SvgText>\n`

  return {
    accessed,
    captures: [],
    index: index + 1,
    uses: ['SvgText'],
  }
}
