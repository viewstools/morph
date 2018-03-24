const stringify = slot =>
  slot.type === 'array'
    ? JSON.stringify([
        { id: 'item1' },
        { id: 'item2' },
        { id: 'item3' },
        { id: 'item4' },
        { id: 'item5' },
      ])
    : /^[0-9]+$/.test(slot.defaultValue)
      ? slot.defaultValue
      : JSON.stringify(slot.defaultValue)

export default ({ state, name }) => {
  const slots = state.slots
    .filter(
      slot =>
        slot.defaultValue !== false || (state.debug && slot.type === 'array')
    )
    .map(slot => `${slot.name}: ${stringify(slot)}`)

  return slots.length === 0
    ? ''
    : `${name}.defaultProps = {${slots.join(',\n')}}`
}
