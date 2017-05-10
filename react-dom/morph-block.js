import {
  CaptureEmail,
  CaptureFile,
  CaptureInput,
  CaptureNumber,
  CapturePhone,
  CaptureSecure,
  CaptureText,
} from './capture.js'
import { extractCode, hasCode } from './code.js'
import { Horizontal, Vertical } from './group.js'
import morphProps from './morph-props.js'
import Image from './image.js'
import List from './list.js'
import Proxy from './proxy.js'
import Style from './style.js'
import SvgText from './svg-text.js'
import Text from './text.js'

const morphers = {
  CaptureEmail,
  CaptureFile,
  CaptureInput,
  CaptureNumber,
  CapturePhone,
  CaptureSecure,
  CaptureText,
  Horizontal,
  Image,
  List,
  Proxy,
  Style,
  SvgText,
  Text,
  Vertical,
}

export default function* morphBlock({ block, when, ...props }, { index }) {
  const accessed = []
  const uses = []
  let nextIndex = index + 1

  if (when) {
    if (index > 0) {
      yield '{'
    }
    const { accessed: accessedWhen, code: whenCode } = extractCode(when)
    accessedWhen.forEach(a => !accessed.includes(a) && accessed.push(a))
    yield `${whenCode} ? (\n`
  }

  if (morphers[block]) {
    const res = yield* morphers[block](props, {
      block,
      index,
    })
    nextIndex = res.index
    res.accessed.forEach(b => !accessed.includes(b) && accessed.push(b))
    res.uses.forEach(b => !uses.includes(b) && uses.push(b))
  } else {
    uses.push(block)
    yield `<${block}`
    const { blocks, ...rest } = props

    const res = yield* morphProps(rest, {
      block,
      index,
    })
    res.accessed.forEach(b => !accessed.includes(b) && accessed.push(b))
    res.uses.forEach(b => !uses.includes(b) && uses.push(b))

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

      yield `</${block}>\n`
    } else {
      yield `/>\n`
    }
  }

  if (when) {
    yield `\n) : null`
    if (index > 0) {
      yield '}'
    }
    yield '\n'
  }

  return {
    accessed,
    index: nextIndex,
    uses,
  }
}
