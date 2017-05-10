import morphBlock from './morph-block.js'
import morphProps from './morph-props.js'

export default function* Group(
  {
    blockIs,
    blocks,
    className,
    goTo,
    id,
    isActive,
    key,
    onClick,
    ref,
    style,
    styleActive,
    styleActiveHover,
    styleHover,
    teleportTo,
  },
  { block, index }
) {
  const accessed = []
  const isActionable = teleportTo || goTo || onClick
  const props = { blockIs }
  const uses = []
  let nextIndex = index + 1

  let tag = 'div'
  if (teleportTo) {
    tag = 'ViewsTeleport'
    uses.push(tag)
    props.to = teleportTo
    props._ref = ref
  } else if (goTo) {
    // TODO I think goTo should also go into Teleport
    tag = 'a'
    props.ref = ref
    props.href = goTo
  } else if (onClick) {
    tag = 'ViewsAction'
    uses.push(tag)
    props._ref = ref
  } else {
    props.ref = ref
  }

  if (className) props.className = className
  if (id) props.id = id
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

  const res = yield* morphProps(props, {
    block,
    index,
  })
  if (res.hasProps) {
    res.accessed.forEach(b => !accessed.includes(b) && accessed.push(b))
    res.uses.forEach(b => !uses.includes(b) && uses.push(b))
  }

  if (blocks) {
    yield '>\n'

    for (const child of blocks) {
      const res = yield* morphBlock(child, {
        block: child.block,
        index: nextIndex,
      })
      nextIndex = res.index
      res.accessed.forEach(b => !accessed.includes(b) && accessed.push(b))
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
