let IS_INT = /^([0-9]+)(.*)$/
let IS_FLOAT = /^([0-9]+\.[0-9]+)(.*)$/

let MULTIPLE_BY_FONT_SIZE = 'x font size'
let PIXEL = 'px'
let PERCENTAGE = '%'
let EM = 'em'
let REM = 'rem'
let VW = 'vw'
let VH = 'vh'

let DEGREES = 'deg'
let GRADIANS = 'grad'
let RADIANS = 'rad'
let TURN = 'turn'

let getUnit = (node) => {
  let units = getUnits(node.name)

  if (typeof node.value === 'number') return units[0] || ''

  let match = node.value.match(IS_INT.test(node.value) ? IS_INT : IS_FLOAT)
  return (match && units.find((u) => u === match[2])) || units[0] || ''
}
export default getUnit

let LENGTH = [PIXEL, PERCENTAGE, EM, REM, VW, VH]
let PERCENTAGE_FIRST_LENGTH = [PERCENTAGE, PIXEL, EM, REM, VW, VH]
let MULTIPLE_BY_FONT_SIZE_LENGTH = [
  MULTIPLE_BY_FONT_SIZE,
  PIXEL,
  PERCENTAGE,
  EM,
  REM,
  VW,
  VH,
]
let ANGLE = [DEGREES, GRADIANS, RADIANS, TURN]
let UNITLESS = []

let UNITS = {
  blurRadius: LENGTH,
  borderBottomLeftRadius: LENGTH,
  borderBottomRightRadius: LENGTH,
  borderBottomWidth: LENGTH,
  borderLeftWidth: LENGTH,
  borderRadius: LENGTH,
  borderRightWidth: LENGTH,
  borderTopLeftRadius: LENGTH,
  borderTopRightRadius: LENGTH,
  borderTopWidth: LENGTH,
  borderWidth: LENGTH,
  bottom: LENGTH,
  flexBasis: PERCENTAGE_FIRST_LENGTH,
  flexGrow: UNITLESS,
  flexShrink: UNITLESS,
  fontSize: LENGTH,
  height: LENGTH,
  left: LENGTH,
  letterSpacing: UNITLESS,
  lineHeight: MULTIPLE_BY_FONT_SIZE_LENGTH,
  margin: LENGTH,
  marginBottom: LENGTH,
  marginLeft: LENGTH,
  marginRight: LENGTH,
  marginTop: LENGTH,
  maxHeight: LENGTH,
  maxWidth: LENGTH,
  minHeight: LENGTH,
  minWidth: LENGTH,
  offsetX: LENGTH,
  offsetY: LENGTH,
  opacity: UNITLESS,
  outline: LENGTH,
  padding: LENGTH,
  paddingBottom: LENGTH,
  paddingLeft: LENGTH,
  paddingRight: LENGTH,
  paddingTop: LENGTH,
  perspective: LENGTH,
  right: LENGTH,
  rotate: ANGLE,
  rotateX: ANGLE,
  rotateY: ANGLE,
  scale: UNITLESS,
  scaleX: UNITLESS,
  scaleY: UNITLESS,
  strokeDasharray: UNITLESS,
  strokeDashoffset: UNITLESS,
  shadowOffsetY: LENGTH,
  shadowOffsetX: LENGTH,
  shadowBlur: LENGTH,
  shadowSpread: LENGTH,
  skew: ANGLE,
  spreadRadius: LENGTH,
  top: LENGTH,
  translateX: LENGTH,
  translateY: LENGTH,
  width: LENGTH,
  wordSpacing: LENGTH,
  zIndex: UNITLESS,
}
let UNITS_KEYS = Object.keys(UNITS)

let getUnits = (key) => {
  let found = UNITS_KEYS.find((ukey) => key.startsWith(ukey))
  return UNITS[found] || UNITLESS
}
