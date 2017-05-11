import morphProps from './morph-props.js'

// TODO migrate src
// TODO morph onClick for debug
export default function* Image(
  { source, src, style },
  { block, debug, index }
) {
  yield `<Image`
  const { accessed, hasProps } = yield* morphProps(
    { source: { uri: source || src || '' }, style },
    { block, debug, index }
  )
  yield `/>\n`

  return {
    accessed,
    captures: [],
    index: index + 1,
    uses: ['Image'],
  }
}
