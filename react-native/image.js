import morphProps from './morph-props.js'

// TODO migrate src
// TODO morph onClick for debug
export default function* Image({ source, src, style }, { block, debug, indent, index }) {
  yield `${indent}<Image`
  const { accessed, hasProps } = yield* morphProps({ source: { uri: source || src || '' }, style }, { block, debug, indent: `${indent}  `, index })
  if (hasProps) yield indent
  yield `/>\n`

  return {
    accessed,
    captures: [],
    index: index + 1,
    uses: [
      'Image',
    ]
  }
}
