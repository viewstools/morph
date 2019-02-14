import { isRowStyle, isStyle, STYLE } from './prop-is-style.js'
import DidYouMeanMatcher from './did-you-mean.js'
import isNumber from './prop-is-number.js'
import locales from 'i18n-locales'
import toSlugCase from 'to-slug-case'

const LOCAL_SCOPES = locales.map(item => item.replace(/-/g, ''))

const dymBlockMatcher = new DidYouMeanMatcher(
  'Capture|CaptureTextArea|G|Horizontal|Image|List|Proxy|Svg|SvgCircle|SvgEllipse|SvgDefs|SvgGroup|SvgLinearGradient|SvgRadialGradient|SvgLine|SvgPath|SvgPolygon|SvgPolyline|SvgRect|SvgSymbol|SvgText|SvgUse|SvgStop|Text|Vertical'.split(
    '|'
  )
)
const dymPropMatcher = new DidYouMeanMatcher([
  ...STYLE,
  'defaultValue',
  'type',
  'fill',
  'stroke',
  'from',
  'key',
  'viewBox',
  'stroke',
  'strokeWidth',
  'strokeLinecap',
  'strokeMiterlimit',
  'at',
  'd',
  'x',
  'cx',
  'cy',
  'r',
  'x1',
  'y1',
  'y',
  'x2',
  'y2',
  'strokeLinejoin',
  'onBlur',
  'onChange',
  'onClick',
  'onDrag',
  'onDragEnd',
  'onDragOver',
  'onDragStart',
  'onFocus',
  'onMouseDown',
  'onMouseMove',
  'onMouseOver',
  'onMouseUp',
  'onWheel',
  'onWhen',
  'ref',
  'tabIndex',
  'text',
  'value',
  'when',
  'key',
  'maxLength',
  'step',
  'id',
  'className',
])

export const didYouMeanBlock = block => dymBlockMatcher.get(block)
export const didYouMeanProp = prop => dymPropMatcher.get(prop)

const ANIMATION = /(.+)(?:\s)(spring|linear|easeOut|easeInOut|easeIn|ease)(?:\s?(.*)?)/
const BASIC = /^(Capture|CaptureTextArea|Column|Horizontal|Image|List|Proxy|Svg|SvgCircle|SvgEllipse|SvgDefs|SvgGroup|SvgLinearGradient|SvgRadialGradient|SvgLine|SvgPath|SvgPolygon|SvgPolyline|SvgRect|SvgSymbol|SvgText|SvgUse|SvgStop|Table|Text|Vertical)$/i
const BLOCK = /^([A-Z][a-zA-Z0-9]*)(\s+([A-Z][a-zA-Z0-9]*))?$/
const BOOL = /^(false|true)$/i
const CAPTURE = /^(Capture|CaptureTextArea)$/i
export let CAPTURE_TYPES = [
  'email',
  'file',
  'number',
  'phone',
  'secure',
  'text',
]
const COMMENT = /^#(.+)$/
const FLOAT = /^-?[0-9]+\.[0-9]+$/
const FONTABLE = /^(Capture|CaptureTextArea|Text)$/
const INT = /^-?[0-9]+$/
const NOT_GROUP = /^(Image|Text|Proxy|SvgCircle|SvgEllipse|SvgLine|SvgPath|SvgPolygon|SvgPolyline|SvgRect|SvgText|SvgStop)$/i
const PROP = /^([a-z][a-zA-Z0-9]*)(\s+(.+))?$/
const UNSUPPORTED_SHORTHAND = {
  border: ['borderWidth', 'borderStyle', 'borderColor'],
  borderBottom: ['borderBottomWidth', 'borderBottomStyle', 'borderBottomColor'],
  borderTop: ['borderTopWidth', 'borderTopStyle', 'borderTopColor'],
  borderRight: ['borderRightWidth', 'borderRightStyle', 'borderRightColor'],
  borderLeft: ['borderLeftWidth', 'borderLeftStyle', 'borderLeftColor'],
  borderRadius: [
    'borderTopLeftRadius',
    'borderTopRightRadius',
    'borderBottomLeftRadius',
    'borderBottomRightRadius',
  ],
  boxShadow: [
    'shadowOffsetX',
    'shadowOffsetY',
    'shadowBlur',
    'shadowSpread',
    'shadowColor',
  ],
  flex: ['flexGrow', 'flexShrink', 'flexBasis'],
  margin: ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'],
  padding: ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'],
  textShadow: ['shadowOffsetX', 'shadowOffsetY', 'shadowBlur', 'shadowColor'],
  outline: ['outlineWidth', 'outlineStyle', 'outlineColor'],
  overflow: ['overflowX', 'overflowY'],
  transform: [
    'rotate',
    'rotateX',
    'rotateY',
    'scale',
    'translateX',
    'translateY',
  ],
  transformOrigin: ['transformOriginX', 'transformOriginY'],
}
const TRUE = /^true$/i
const USER_COMMENT = /^##(.*)$/
// TODO slot can't start with a number
const SLOT = /^<((!)?([a-zA-Z0-9]+))?(\s+(.+))?$/

export const is = (thing, line) => thing.test(line)
export const isAnimation = line => is(ANIMATION, line)
export const isBasic = line => is(BASIC, line)
export const isBlock = line => is(BLOCK, line)
export const isBool = line => is(BOOL, line)
export const isCapture = line => is(CAPTURE, line)
export const isColumn = line => line === 'Column'
export const isComment = line => is(COMMENT, line)
export const isEmptyText = line => line === ''
export const isEnd = line => line === ''
export const isFloat = line => is(FLOAT, line)
export const isFragment = line => line === 'isFragment'
export const isFontable = line => is(FONTABLE, line)
export const isGroup = line => !is(NOT_GROUP, line) && !isCapture(line)
export const isList = line => line === 'List'
export const isInt = line => is(INT, line)
export const isProp = line => is(PROP, line)
export const isSlot = line => is(SLOT, line)
export const isTable = line => line === 'Table'
export const isUnsupportedShorthand = name => name in UNSUPPORTED_SHORTHAND
export { isRowStyle, isStyle }
export const isTrue = line => is(TRUE, line)
export const isUserComment = line => is(USER_COMMENT, line)

const get = (regex, line) => line.match(regex)

const addDefaults = (animationType, properties) => {
  // if (!properties.delay) {
  //   properties.delay = 0
  // }

  if (animationType !== 'spring' && !properties.duration) {
    properties.duration = 150
  } else if (animationType === 'spring') {
    if (!properties.tension) {
      properties.tension = 170
    }
    if (!properties.friction) {
      properties.friction = 26
    }
  }
  return properties
}

export const getAnimation = line => {
  // eslint-disable-next-line
  const [_, defaultValue, animationType, animationValues] = get(ANIMATION, line)
  let properties = {
    curve: animationType,
  }

  if (animationValues) {
    const values = animationValues.split(' ')
    for (let i = 0; i < values.length; i = i + 2) {
      properties[values[i]] = getValue(values[i + 1])
    }
  }

  addDefaults(animationType, properties)

  return {
    id: Object.keys(properties)
      .sort()
      .map(key => `${key}${properties[key]}`)
      .join(''),
    defaultValue: getValue(defaultValue),
    properties,
  }
}

export const getBlock = line => {
  // eslint-disable-next-line
  const [_, is, _1, block] = get(BLOCK, line)
  return {
    block: block || is,
    is: block ? is : null,
  }
}
export const getComment = line => {
  try {
    return get(COMMENT, line).slice(1)
  } catch (err) {
    return ''
  }
}
export const getFormat = line => {
  let properties = {}
  const values = line.split(' ')
  const formatKey = values[0]

  if (values.length === 2) {
    properties[formatKey] = values[1]
  } else {
    properties[formatKey] = {}
    for (let i = 1; i < values.length; i = i + 2) {
      properties[formatKey][values[i]] = getValue(values[i + 1])
    }
  }

  return properties
}
export const getProp = line => {
  // eslint-disable-next-line
  let [_, name, _1, value = ''] = get(PROP, line)

  const prop = { name, isSlot: false, value }

  if (is(SLOT, value)) {
    const [
      // eslint-disable-next-line
      _2,
      slotIsNot = false,
      slotName = '',
      // eslint-disable-next-line
      _3,
      // eslint-disable-next-line
      defaultValue = '',
    ] = getSlot(value)

    prop.isSlot = true
    prop.slotIsNot = slotIsNot === '!'
    prop.slotName = slotName
    prop.value = defaultValue || value
  }

  return prop
}
export const getSlot = line => get(SLOT, line).slice(1)
export const getUnsupportedShorthandExpanded = (name, value) => {
  const props = UNSUPPORTED_SHORTHAND[name]

  if (name === 'borderRadius') {
    const theValue = value.replace('px', '')

    return [
      `${props[0]} ${theValue}`,
      `${props[1]} ${theValue}`,
      `${props[2]} ${theValue}`,
      `${props[3]} ${theValue}`,
    ]
  } else if (name.startsWith('border') || name === 'outline') {
    const [width, style, ...color] = value.split(' ')

    return [
      `${props[0]} ${width.replace('px', '')}`,
      `${props[1]} ${style}`,
      `${props[2]} ${color.join(' ')}`,
    ]
  } else if (name === 'boxShadow') {
    const [offsetX, offsetY, blurRadius, spreadRadius, ...color] = value.split(
      ' '
    )

    return [
      `${props[0]} ${offsetX.replace('px', '')}`,
      `${props[1]} ${offsetY.replace('px', '')}`,
      `${props[2]} ${blurRadius.replace('px', '')}`,
      `${props[3]} ${spreadRadius.replace('px', '')}`,
      `${props[4]} ${color.join(' ')}`,
    ]
  } else if (name === 'textShadow') {
    const [offsetX, offsetY, blurRadius, ...color] = value.split(' ')

    return [
      `${props[0]} ${offsetX.replace('px', '')}`,
      `${props[1]} ${offsetY.replace('px', '')}`,
      `${props[2]} ${blurRadius.replace('px', '')}`,
      `${props[3]} ${color.join(' ')}`,
    ]
  } else if (name === 'overflow') {
    return [`${props[0]} ${value}`, `${props[1]} ${value}`]
  } else if (name === 'padding' || name === 'margin') {
    let [top, right, bottom, left] = value.split(' ')
    top = top.replace('px', '')
    right = right ? right.replace('px', '') : top
    bottom = bottom ? bottom.replace('px', '') : top
    left = left ? left.replace('px', '') : right || top

    return [
      `${props[0]} ${top}`,
      `${props[1]} ${right}`,
      `${props[2]} ${bottom}`,
      `${props[3]} ${left}`,
    ]
  } else if (name === 'flex') {
    return [`flexGrow ${value}`, 'flexShrink 1', 'flexBasis 0%']
  } else if (name === 'transform') {
    return [`expand the values like: translateX 10`]
  } else if (name === 'transformOrigin') {
    const [x, y] = value.split(' ')
    return [`${props[0]} ${x}`, `${props[1]} ${y || x}`]
  }

  return []
}
export const getValue = (value, name) => {
  if (isFloat(value)) {
    return parseFloat(value, 10)
  } else if (isInt(value)) {
    return parseInt(value, 10)
  } else if (isEmptyText(value)) {
    return ''
  } else if (isBool(value)) {
    return isTrue(value)
  } else {
    return maybeMakeHyphenated(value, name)
  }
}

export const isLocalScope = name => LOCAL_SCOPES.includes(name)

const SYSTEM_SCOPES = [
  'isDisabled',
  'isFocused',
  'isHovered',
  'isPlaceholder',
  // TODO do we want to do media queries here?
]
export const isSystemScope = name => SYSTEM_SCOPES.includes(name)

const isActionable = name => name !== 'onWhen' && /^on[A-Z]/.test(name)

export const getPropType = (block, name, defaultValue) =>
  block.isList && name === 'from'
    ? 'array'
    : isActionable(name)
    ? 'function'
    : isNumber[name]
    ? 'number'
    : 'string'

export const isTextInterpolation = (block, previous) => {
  const previousText = previous.properties.find(prop => prop.name === 'text')
  return (
    block.name === 'Text' &&
    previousText &&
    previousText.value.includes(block.is || block.name)
  )
}

const MAYBE_HYPHENATED_STYLE_PROPS = [
  'alignContent',
  'alignItems',
  'alignSelf',
  'backgroundBlendMode',
  'backgroundClip',
  'backgroudOrigin',
  'backgroundRepeat',
  'boxSizing',
  'clear',
  'cursor',
  'flexBasis',
  'flexDirection',
  'flexFlow',
  'flexWrap',
  'float',
  'fontStretch',
  'justifyContent',
  'objectFit',
  'overflowWrap',
  'textAlign',
  'textDecorationLine',
  'textTransform',
  'whiteSpace',
  'wordBreak',
]

export const maybeMakeHyphenated = (value, name) =>
  MAYBE_HYPHENATED_STYLE_PROPS.includes(name) && /^[a-zA-Z]+$/.test(value)
    ? toSlugCase(value)
    : value
