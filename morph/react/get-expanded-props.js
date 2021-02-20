function stringify(slot) {
  if (slot.type === 'array') {
    return JSON.stringify([])
  } else if (/^[0-9]+$/.test(slot.defaultValue) || slot.type === 'import') {
    return slot.defaultValue
  } else {
    return JSON.stringify(slot.defaultValue)
  }
}

let IGNORED_SLOTS = new Set([
  'isPlaceholder',
  'isFocused',
  // needed for get-use-is-hovered
  // 'isDisabled',
  'isHovered',
  'isSelectedHovered',
  'setFlowTo',
  'isBefore',
  'isMediaDesktop',
  'isMediaMobile',
  'isMediaLaptop',
])
export default function getExpandedProps({ state }) {
  let slots = state.slots
    .filter((slot) => !IGNORED_SLOTS.has(slot.name))
    .map((slot) => {
      let maybeDefaultValue =
        slot.defaultValue === false ? '' : `= ${stringify(slot)}`
      return `${slot.name}${maybeDefaultValue}`
    })

  if (
    state.useIsSelected &&
    !state.slots.some((slot) => slot.name === 'isSelected')
  ) {
    slots.push('isSelected')
  }
  if (
    !state.useIsHovered &&
    state.slots.some((slot) => slot.name === 'isHovered')
  ) {
    slots.push('isHovered')
  }

  return `{
  children,
  '${state.testIdKey}': ${state.testIdKeyAsProp},
  '${state.viewPathKey}': ${state.viewPathKeyAsProp},
  ${slots.join(',\n')}
}`
}
