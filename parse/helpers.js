import { all as COLOR } from 'synesthesia'
import cssProperties from 'css-properties'
import toCamelCase from 'to-camel-case'

const BASIC = /^(CaptureEmail|CaptureFile|CaptureInput|CaptureNumber|CapturePhone|CaptureSecure|CaptureText|G|Horizontal|Image|Input|List|Select|Style|Svg|SvgDefs|SvgFeMerge|SvgFilter|Text|Vertical)$/i
const BLOCK = /^([A-Z][a-zA-Z0-9]*)(\s+[a-z\s]*([A-Z][a-zA-Z0-9]*))?$/
const BOOL = /^(false|true)$/i
const CAPTURE = /^(CaptureEmail|CaptureFile|CaptureInput|CaptureNumber|CapturePhone|CaptureSecure|CaptureText)$/i
const CODE_EXPLICIT = /^{.+}$/
const CODE_IMPLICIT = /(props|item|index)\./
const COMMENT = /^#\s*(.+)$/
const DATA = /^.+\.data$/
const EMPTY_LIST = /^is empty list$/i
const EMPTY_TEXT = /^is empty text$/i
const FLOAT = /^[0-9]+\.[0-9]+$/
const FONTABLE = /^(CaptureEmail|CaptureInput|CaptureNumber|CapturePhone|CaptureSecure|CaptureText|Input|Text)$/
const GROUP = /^(G|Horizontal|List|Svg|SvgDefs|SvgFeMerge|SvgFilter|Vertical)$/i
const LIST = /^List$/
const INT = /^[0-9]+$/
const ITEM = /^item[A-Z]*$/
const MARGIN = /^margin/
const PADDING = /^padding/
const PROP = /^([a-z][a-zA-Z0-9]*)\s+(.+)$/
const PROP_STYLE_STEMS = /^([a-z][A-Z0-9]*?)(Active|ActiveHover|Hover|Placeholder|Disabled|Print)?$/i
const SECTION = /^([a-z][a-zA-Z0-9]*)$/
const STYLE = new RegExp(
  `^(${cssProperties.map(toCamelCase).join('|')}|heightBlocked)$`
)
const TERNARY = /\?\s*['"]?\s*(.+)?\s*['"]?\s*:\s*['"]?\s*(.+)\s*['"]?\s*/
const TEXT = /^Text$/
const TODO = /TODO\s*(@([a-z]+))?\s*(.+)/i
const TOGGLE = new RegExp(`^toggle (props|item).(.+)$`)
const TRUE = /^true$/i

export const is = (thing, line) => thing.test(line)
export const isBasic = line => is(BASIC, line)
export const isBlock = line => is(BLOCK, line)
export const isBool = line => is(BOOL, line)
export const isCapture = line => is(CAPTURE, line)
export const isData = line => is(DATA, line)
export const isCode = line =>
  isCodeOneWord(line) || is(CODE_EXPLICIT, line) || is(CODE_IMPLICIT, line)
export const isCodeOneWord = line =>
  line === 'props' || line === 'item' || line === 'index'
// TODO
export const isCodeInvalid = line => {
  return getCodeData(line).find(
    l =>
      /\. /.test(l) || // props. x
      / \./.test(l) || // props .
      / \[/.test(l) || // props[
      /\]/.test(l) // props]
  )
}
export const isComment = line => is(COMMENT, line)
export const isColor = line => is(COLOR, line)
export const isEmptyList = line => is(EMPTY_LIST, line)
export const isEmptyText = line => is(EMPTY_TEXT, line)
export const isEnd = line => line === ''
export const isFloat = line => is(FLOAT, line)
export const isFontable = line => is(FONTABLE, line)
export const isGroup = line => is(GROUP, line)
export const isList = line => is(LIST, line)
export const isInt = line => is(INT, line)
export const isItem = line => is(ITEM, line)
export const isMargin = line => is(MARGIN, line)
export const isPadding = line => is(PADDING, line)
export const isProp = line => is(PROP, line)
export const isText = line => is(TEXT, line)
export const isSection = line => is(SECTION, line)
export const isStyle = line => is(STYLE, line)
export const isTodo = line => is(TODO, line)
export const isToggle = line => is(TOGGLE, line)
export const isTrue = line => is(TRUE, line)

const get = (regex, line) => line.match(regex)

export const getBlock = line => {
  const match = get(BLOCK, line)
  if (match[3]) {
    return {
      block: match[3],
      is: match[1],
    }
  } else {
    return {
      block: match[1],
      is: null,
    }
  }
}
export const getCodeData = line => {
  if (isCodeOneWord(line)) return [line]

  return line
    .replace(/^{/, '')
    .replace(/}$/, '')
    .split(' ')
    .filter(l => isCodeOneWord(l) || /[.[]/.test(l))
}
export const getComment = line => get(COMMENT, line).slice(1)
export const getColor = line => get(COLOR, line)
export const getFontInfo = (fontFamily, fontWeight) => {
  const fonts = []

  const families = []
  const familyTernary = fontFamily.match(TERNARY)
  if (familyTernary) {
    families.push(getMainFont(familyTernary[1]), getMainFont(familyTernary[2]))
  } else {
    families.push(getMainFont(fontFamily))
  }

  const weights = []

  if (typeof fontWeight === 'string') {
    const weightTernary = fontWeight.match(TERNARY)
    if (weightTernary) {
      weights.push(weightTernary[1], weightTernary[2])
    } else {
      weights.push(fontWeight)
    }
  } else if (typeof fontWeight === 'number') {
    weights.push(`${fontWeight}`)
  } else if (typeof fontWeight === 'undefined') {
    // default to 400
    weights.push('400')
  }

  families.forEach(family => {
    if (weights.length) {
      weights.forEach(weight => {
        fonts.push({
          family,
          weight,
        })
      })
    } else {
      fonts.push({
        family,
      })
    }
  })

  return fonts
}
export const getMainFont = line => line.split(',')[0].replace(/['"]/g, '')
export const getProp = line => get(PROP, line).slice(1)
export const getSection = line => get(SECTION, line)[1]
export const getTodo = line => get(TODO, line).slice(1)
export const getToggle = line => get(TOGGLE, line)[2]
export const getValue = value => {
  if (isFloat(value)) {
    return parseFloat(value, 10)
  } else if (isInt(value)) {
    return parseInt(value, 10)
  } else if (isEmptyText(value)) {
    return ''
  } else if (isBool(value)) {
    return isTrue(value)
  } else {
    return value
  }
}

export const stemStylesFromProp = (block, raw) => {
  if (!block.isBasic) return [raw, false]

  const [prop, tag] = get(PROP_STYLE_STEMS, raw).slice(1)

  return tag && !isStyle(prop)
    ? [raw]
    : [prop, typeof tag === 'string' ? toCamelCase(tag) : undefined]
}

export const warn = (message, block) => {
  if (!Array.isArray(block.warnings)) {
    block.warnings = []
  }
  block.warnings.push(message)
}
