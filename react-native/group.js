import { ACTION, TELEPORT } from '../types.js'
import morphBlock from './morph-block.js'
import morphProps from './morph-props.js'

export default function* Group(
  {
    blocks,
    className,
    goTo,
    id,
    isActive,
    key,
    modalTitle,
    modalMessage,
    modalOKLabel,
    modalOKAction,
    modalCancelLabel,
    modalCancelAction,
    onClick,
    ref,
    style,
    styleActive,
    styleActiveHover,
    styleHover,
    teleportTo,
  },
  { custom, index }
) {
  const accessed = []
  const captures = []
  const isActionable = teleportTo || goTo || onClick
  const props = {}
  const uses = []
  let nextIndex = index + 1

  let tag = 'View'
  if (teleportTo) {
    tag = TELEPORT
    props.to = teleportTo
    props._ref = ref
  } else if (goTo) {
    // TODO I think goTo should also go into Teleport
    tag = 'Link'
    props.ref = ref
    props.href = goTo
  } else if (onClick) {
    tag = ACTION
    props._ref = ref
  } else {
    if (style && (style.overflowY === 'auto' || style.overflowY === 'scroll')) {
      tag = 'ScrollView'
    }
    props.ref = ref
  }

  uses.push(tag)

  // if (className) props.className = className
  // if (id) props.id = id
  if (isActionable) {
    if (isActive) props.isActive = isActive
    if (styleHover) props.styleHover = styleHover
    if (styleActive) props.styleActive = styleActive
    if (styleActiveHover) props.styleActiveHover = styleActiveHover
  }
  if (key) props.key = key
  if (onClick) props.onClick = onClick
  if (style) props.style = style

  yield `<${tag}`

  const { accessed: accessedProps, hasProps } = yield* morphProps(props, {
    block: tag,
    index,
  })
  if (hasProps) {
    accessedProps.forEach(b => !accessed.includes(b) && accessed.push(b))
  }

  if (blocks) {
    yield '>\n'

    for (const child of blocks) {
      const res = yield* morphBlock(child, { custom, index: nextIndex })
      nextIndex = res.index
      res.accessed.forEach(b => !accessed.includes(b) && accessed.push(b))
      res.captures.forEach(b => !captures.includes(b) && captures.push(b))
      res.uses.forEach(b => !uses.includes(b) && uses.push(b))
    }

    if (index === 0) {
      yield '{props.children}'
    }
    yield `</${tag}>`
  } else {
    if (index === 0) {
      yield '{props.children}'
      yield `</${tag}>`
    } else {
      yield `/>`
    }
  }
  yield '\n'

  return {
    accessed,
    captures,
    index: nextIndex,
    uses,
  }
}

export function* Horizontal({ style, ...rest }, options) {
  return yield* Group(
    {
      style: {
        flexDirection: 'row',
        ...style,
      },
      ...rest,
    },
    options
  )
}

export function* Vertical({ style, ...rest }, options) {
  return yield* Group(
    {
      style: {
        flexDirection: 'column',
        ...style,
      },
      ...rest,
    },
    options
  )
}
