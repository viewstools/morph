let HOVERED_PROPS = new Set([
  'isDisabled',
  'isSelected',
  'onMouseEnter',
  'onMouseLeave',
])

export default function getUseIsHovered({ state }) {
  let hoveredProps = state.slots
    .filter((slot) => HOVERED_PROPS.has(slot.name))
    .map((slot) => slot.name)

  return `let [isHovered, isSelectedHovered, isHoveredBind] = useIsHovered({${hoveredProps.join(
    ','
  )}})`
}
