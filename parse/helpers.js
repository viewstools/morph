import cssProperties from 'css-properties'
import toCamelCase from 'to-camel-case'

const BASIC = /^(CaptureEmail|CaptureFile|CaptureNumber|CapturePhone|CaptureSecure|CaptureText|CaptureTextArea|G|Horizontal|Image|List|Svg|SvgCircle|SvgEllipse|SvgDefs|SvgGroup|SvgLinearGradient|SvgRadialGradient|SvgLine|SvgPath|SvgPolygon|SvgPolyline|SvgRect|SvgSymbol|SvgText|SvgUse|SvgStop|Text|Vertical|FakeProps)$/i
const BLOCK = /^([A-Z][a-zA-Z0-9]*)(\s+([A-Z][a-zA-Z0-9]*))?$/
const BOOL = /^(false|true)$/i
const CAPTURE = /^(CaptureEmail|CaptureFile|CaptureNumber|CapturePhone|CaptureSecure|CaptureText|CaptureTextArea)$/i
const CODE_EXPLICIT = /^{.+}$/
const CODE_IMPLICIT = /props\./
const CODE_DEFAULT = /^props$/
const COMMENT = /^#(.+)$/
const INTERPOLATED_EXPRESSION = /\${.+}/
const FLOAT = /^[0-9]+\.[0-9]+$/
const FONTABLE = /^(CaptureEmail|CaptureNumber|CapturePhone|CaptureSecure|CaptureText|CaptureTextArea|Text)$/
const INT = /^[0-9]+$/
const NOT_GROUP = /^(Image|FakeProps|Text|Proxy|SvgCircle|SvgEllipse|SvgLine|SvgPath|SvgPolygon|SvgPolyline|SvgRect|SvgText|SvgStop)$/i
const PROP = /^([a-z][a-zA-Z0-9]*)(\s+(.+))?$/
const STYLE = new RegExp(
  `^(${cssProperties
    .map(toCamelCase)
    .join(
      '|'
    )}|pointerEvents|clipPath|appRegion|userSelect|hyphens|overflowWrap)$`
)
const TEMPLATE_LITERAL = /^`.+`$/
const TRUE = /^true$/i
const USER_COMMENT = /^##(.*)$/

export const is = (thing, line) => thing.test(line)
export const isBasic = line => is(BASIC, line)
export const isBlock = line => is(BLOCK, line)
export const isBool = line => is(BOOL, line)
export const isCapture = line => is(CAPTURE, line)
export const isCode = line =>
  is(CODE_EXPLICIT, line) || is(CODE_IMPLICIT, line) || isCodeDefault(line)
export const isCodeDefault = line => is(CODE_DEFAULT, line)
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
export const isEmptyList = line => line === 'is empty list'
export const isEmptyText = line => line === ''
export const isEnd = line => line === ''
export const isInterpolatedExpression = line =>
  is(INTERPOLATED_EXPRESSION, line)
export const isFloat = line => is(FLOAT, line)
export const isFontable = line => is(FONTABLE, line)
export const isGroup = line => !is(NOT_GROUP, line) && !isCapture(line)
export const isList = line => line === 'List'
export const isInt = line => is(INT, line)
export const isProp = line => is(PROP, line)
export const isTemplateLiteral = line => is(TEMPLATE_LITERAL, line)
export const isStyle = line => is(STYLE, line)
export const isTrue = line => is(TRUE, line)
export const isUserComment = line => is(USER_COMMENT, line)

const get = (regex, line) => line.match(regex)

export const getBlock = line => {
  // eslint-disable-next-line
  const [_, is, _1, block] = get(BLOCK, line)
  return {
    block: block || is,
    is: block ? is : null,
  }
}
export const getCodeData = line =>
  line
    .replace(/^{/, '')
    .replace(/}$/, '')
    .split(' ')
    .filter(l => /[.[]/.test(l))
export const getComment = line => {
  try {
    return get(COMMENT, line).slice(1)
  } catch (err) {
    return ''
  }
}
export const getMainFont = line =>
  line ? line.split(',')[0].replace(/['"]/g, '') : ''
export const getProp = line => {
  // eslint-disable-next-line
  let [_, prop, _1, value = ''] = get(PROP, line)
  if (isCodeDefault(value)) {
    value = `props.${prop}`
  }
  return [prop, value]
}
export const getValue = value => {
  if (isFloat(value)) {
    return parseFloat(value, 10)
  } else if (isInt(value)) {
    return parseInt(value, 10)
  } else if (isEmptyText(value)) {
    return ''
  } else if (isBool(value)) {
    return isTrue(value)
  } else if (isInterpolatedExpression(value)) {
    return fixBackticks(value)
  } else {
    return value
  }
}

export const fixBackticks = value =>
  isTemplateLiteral(value) ? value : `\`${value}\``

export const warn = (message, block) => {
  if (!Array.isArray(block.warnings)) {
    block.warnings = []
  }
  block.warnings.push(message)
}

const SYSTEM_SCOPES = [
  'active',
  // TODO disabled should be a prop instead I think
  'disabled',
  'focus',
  'hover',
  'placeholder',
  'print',
  // TODO do we want to do media queries here?
]
export const isSystemScope = name => SYSTEM_SCOPES.includes(name)
