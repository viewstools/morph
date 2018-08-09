const stringify = slot =>
  slot.type === 'array'
    ? JSON.stringify([])
    : /^[0-9]+$/.test(slot.defaultValue) || slot.type === 'import'
      ? slot.defaultValue
      : JSON.stringify(slot.defaultValue)

export default ({ state, name }) => {
  const slots = state.slots
    .filter(slot => slot.defaultValue !== false)
    .map(slot => `${slot.name}: ${stringify(slot)}`)

  return slots.length === 0
    ? ''
    : `${name}.defaultProps = {${slots.join(',\n')}}`
}
