import { CaptureEmail, CaptureInput, CaptureNumber, CapturePhone, CaptureSecure, CaptureText } from './capture.js'
import { extractCode, hasCode } from './code.js'
import { Horizontal, Vertical } from './group.js'
import morphProps from './morph-props.js'
import Image from './image.js'
import List from './list.js'
import Style from './style.js'
import SvgText from './svg-text.js'
import Text from './text.js'

const morphers = {
  CaptureEmail,
  CaptureInput,
  CaptureNumber,
  CapturePhone,
  CaptureSecure,
  CaptureText,
  Horizontal,
  Image,
  List,
  Style,
  SvgText,
  Text,
  Vertical,
}

export default function* morphBlock({ block, when, ...props }, { custom, indent, index }) {
  const accessed = []
  const captures = []
  const uses = []
  let nextIndex = index + 1
  let internalIndent = indent

  if (when) {
    if (index > 0) {
      yield '{'
    }
    const { accessed:accessedWhen, code:whenCode } = extractCode(when)
    accessedWhen.forEach(a => !accessed.includes(a) && accessed.push(a))
    yield `${whenCode} ? (\n`
    internalIndent = `${indent}  `
  }

  if (morphers[block]) {
    const res = yield* morphers[block](props, { block, custom, indent: internalIndent, index })
    nextIndex = res.index
    res.accessed.forEach(b => !accessed.includes(b) && accessed.push(b))
    res.captures.forEach(b => !captures.includes(b) && captures.push(b))
    res.uses.forEach(b => !uses.includes(b) && uses.push(b))
  } else {
    const isCustomBlock = custom.includes(block)
    let tag = isCustomBlock ? block : block.toLowerCase()
    // TODO implement render from props
    if (hasCode(tag)) {
      tag = 'div' // extractCode(tag).code
    }

    yield `${internalIndent}<${tag}`
    const { blocks, ...rest } = props

    if (isCustomBlock) {
      uses.push(block)
    }

    const { accessed:accessedProps, hasProps } = yield* morphProps(rest, { block, indent: `${internalIndent}  `, index })
    accessedProps.forEach(b => !accessed.includes(b) && accessed.push(b))

    if (blocks) {
      if (hasProps) {
        yield internalIndent
      }
      yield '>\n'

      for (const child of blocks) {
        const res = yield* morphBlock(child, { block: child.block, custom, indent: `${internalIndent}  `, index: nextIndex })
        nextIndex = res.index
        res.accessed.forEach(b => !accessed.includes(b) && accessed.push(b))
        res.captures.forEach(b => !captures.includes(b) && captures.push(b))
        res.uses.forEach(b => !uses.includes(b) && uses.push(b))
      }

      yield `${internalIndent}</${tag}>\n`
    } else {
      yield `${internalIndent}/>\n`
    }
  }

  if (when) {
    yield `${indent}\n) : null`
    if (index > 0) {
      yield '}'
    }
    yield '\n'
  }

  return {
    accessed,
    captures,
    index: nextIndex,
    uses,
  }
}
