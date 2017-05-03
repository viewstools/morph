import morphProps from './morph-props.js'

// TODO migrate src
// TODO morph onClick for debug
export default function* Image(
  { source, src, style },
  { block, debug, index }
) {
  yield `<img`
  const { accessed, hasProps } = yield* morphProps(
    { src: source || src, style },
    { block, debug, index }
  )
  yield `/>\n`

  return {
    accessed,
    index: index + 1,
    uses: [],
  }
}
