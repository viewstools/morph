const IS_INT = /^([0-9]+)(.*)$/
const IS_FLOAT = /^([0-9]+\.[0-9]+)(.*)$/

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

export default node => {
  const units = getUnits(node.key.value)

  if (typeof node.value.value === 'number') return units[0]

  const match = node.value.value.match(
    IS_INT.test(node.value.value) ? IS_INT : IS_FLOAT
  )
  return units.find(u => u === match.unit) || units[0]
}

const LENGTH = [PIXEL, PERCENTAGE, EM, REM, VW, VH]
const ANGLE = [DEGREES, GRADIANS, RADIANS, TURN]
const UNITLESS = []

const UNITS = {
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
const UNITS_KEYS = Object.keys(UNITS)

const getUnits = key => {
  const found = UNITS_KEYS.find(ukey => key.startsWith(ukey))
  return UNITS[found] || UNITLESS
}
