import {
  isAnimation,
  isRowStyle,
  isFragment,
  isStyle,
  isUnsupportedShorthand,
} from './helpers.js'

let SLOT_PROPS = [
  'onBlur',
  'onChange',
  'onClick',
  'onDrag',
  'onDragEnd',
  'onDragEnter',
  'onDragExit',
  'onDragLeave',
  'onDragOver',
  'onDragStart',
  'onDrop',
  'onFocus',
  'onFocus',
  'onMouseDown',
  'onMouseEnter',
  'onMouseLeave',
  'onMouseMove',
  'onMouseOver',
  'onMouseUp',
  'onWheel',
  'onWhen',
  'when',
]
let shouldBeSlot = (prop, block) =>
  SLOT_PROPS.includes(prop) || (block.isList && prop === 'from')

export default ({ name, isSlot, slotIsNot, value, block }) => {
  let tags = {}

  if (isAnimation(value) && name !== 'text') tags.animation = true
  if (isStyle(name)) tags.style = true
  if (isRowStyle(name)) {
    tags.style = true
    tags.rowStyle = true
  }
  if (
    isUnsupportedShorthand(name) &&
    block.isBasic &&
    !block.name.startsWith('Svg')
  ) {
    tags.unsupportedShorthand = true
  }

  if (shouldBeSlot(name, block)) tags.shouldBeSlot = true
  if (isSlot) tags.slot = true
  if (slotIsNot) tags.slotIsNot = true

  tags.validSlot = tags.slot || (tags.shouldBeSlot && tags.slot) || null

  if (isFragment(name)) tags.fragment = true

  return tags
}
