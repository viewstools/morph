let IS_INT = /^([0-9]+)(.*)$/
let IS_FLOAT = /^([0-9]+\.[0-9]+)(.*)$/

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

export default (key, value) => {
  let units = getUnits(key)

  if (typeof value === 'number') return units[0] || ''

  let match = value.match(IS_INT.test(value) ? IS_INT : IS_FLOAT)
  return match ? '' : units[0] || ''
}

let LENGTH = [PIXEL, PERCENTAGE, EM, REM, VW, VH]
let ANGLE = [DEGREES, GRADIANS, RADIANS, TURN]
let UNITLESS = []

let UNITS = {
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
  fontSize: LENGTH,
  height: LENGTH,
  left: LENGTH,
  letterSpacing: LENGTH,
  lineHeight: UNITLESS,
  margin: LENGTH,
  marginBottom: LENGTH,
  marginLeft: LENGTH,
  marginRight: LENGTH,
  marginTop: LENGTH,
  maxHeight: LENGTH,
  maxWidth: LENGTH,
  minHeight: LENGTH,
  minWidth: LENGTH,
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
  skew: ANGLE,
  top: LENGTH,
  translateX: LENGTH,
  translateY: LENGTH,
  width: LENGTH,
  wordSpacing: LENGTH,
  zIndex: UNITLESS,
}
let UNITS_KEYS = Object.keys(UNITS)

let getUnits = key => {
  let found = UNITS_KEYS.find(ukey => key.startsWith(ukey))
  return UNITS[found] || UNITLESS
}
