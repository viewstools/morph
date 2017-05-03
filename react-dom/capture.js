import morphBlock from './morph-block.js'
import morphProps from './morph-props.js'

function* Capture(
  { styleActive, styleActiveHover, styleHover, stylePlaceholder, ...props },
  { block, debug, index }
) {
  const uses = []
  let nextIndex = index + 1

  yield `<input`
  const { accessed, hasProps } = yield* morphProps(props, {
    block,
    debug,
    index,
  })
  yield `/>\n`

  return {
    accessed,
    index: nextIndex,
    uses,
  }
}

export function* CaptureEmail(props, options) {
  return yield* Capture(
    {
      ...props,
      type: 'email',
    },
    options
  )
}

export function* CaptureFile(props, options) {
  return yield* Capture(
    {
      ...props,
      type: 'file',
    },
    options
  )
}

export function* CaptureInput(props, options) {
  return yield* Capture(
    {
      ...props,
      type: 'text',
    },
    options
  )
}

export function* CaptureNumber(props, options) {
  return yield* Capture(
    {
      ...props,
      type: 'number',
    },
    options
  )
}

export function* CapturePhone(props, options) {
  return yield* Capture(
    {
      ...props,
      type: 'tel',
    },
    options
  )
}

export function* CaptureSecure(props, options) {
  return yield* Capture(
    {
      ...props,
      type: 'password',
    },
    options
  )
}

export function* CaptureText(props, options) {
  // TODO textarea
  return {
    accessed: [],
    index: options.index,
    uses: [],
  }
}
