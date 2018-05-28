const IS_INT = /^([0-9]+)(.*)$/
const IS_FLOAT = /^([0-9]+\.[0-9]+)(.*)$/

const MULTIPLE_BY_FONT_SIZE = 'x font size'
const PIXEL = 'px'
const PERCENTAGE = '%'
const EM = 'em'
const REM = 'rem'
const VW = 'vw'
const VH = 'vh'

const DEGREES = 'deg'
const GRADIANS = 'grad'
const RADIANS = 'rad'
const TURN = 'turn'

const getUnit = node => {
  const units = getUnits(node.name)

  if (typeof node.value === 'number') return units[0] || ''

  const match = node.value.match(IS_INT.test(node.value) ? IS_INT : IS_FLOAT)
  return (match && units.find(u => u === match[2])) || units[0] || ''
}
export default getUnit

const LENGTH = [PIXEL, PERCENTAGE, EM, REM, VW, VH]
const PERCENTAGE_FIRST_LENGTH = [PERCENTAGE, PIXEL, EM, REM, VW, VH]
const MULTIPLE_BY_FONT_SIZE_LENGTH = [
  MULTIPLE_BY_FONT_SIZE,
  PIXEL,
  PERCENTAGE,
  EM,
  REM,
  VW,
  VH,
]
const ANGLE = [DEGREES, GRADIANS, RADIANS, TURN]
const UNITLESS = []

const UNITS = {
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
  right: LENGTH,
  rotate: ANGLE,
  scale: UNITLESS,
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
const UNITS_KEYS = Object.keys(UNITS)

const getUnits = key => {
  const found = UNITS_KEYS.find(ukey => key.startsWith(ukey))
  return UNITS[found] || UNITLESS
}
