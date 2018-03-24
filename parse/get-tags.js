import { isAnimation, isStyle, isUnsupportedShorthand } from './helpers.js'

const SLOT_PROPS = ['from', 'when', 'onClick', 'onFocus', 'onWhen']
const shouldBeSlot = prop => SLOT_PROPS.includes(prop) || /^on[A-Z]/.test(prop)

export default ({ name, isSlot, slotName, slotIsNot, value, block }) => {
  const tags = {}

  if (isAnimation(value) && name !== 'text') tags.animation = true
  if (isStyle(name)) tags.style = true
  if (isUnsupportedShorthand(name) && block.isBasic) {
    tags.unsupportedShorthand = true
  }

  if (shouldBeSlot(name)) tags.shouldBeSlot = true
  if (isSlot) tags.slot = true
  if (slotIsNot) tags.slotIsNot = true

  tags.validSlot = tags.slot || (tags.shouldBeSlot && tags.slot) || null

  return tags
}
