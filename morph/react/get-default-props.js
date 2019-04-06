let stringify = slot => {
  if (slot.type === 'array') {
    return JSON.stringify([])
  } else if (/^[0-9]+$/.test(slot.defaultValue) || slot.type === 'import') {
    return slot.defaultValue
  } else {
    return JSON.stringify(slot.defaultValue)
  }
}

export default ({ state, name }) => {
  let slots = state.slots
    .filter(slot => slot.defaultValue !== false)
    .map(slot => `${slot.name}: ${stringify(slot)}`)

  return slots.length === 0
    ? ''
    : `${name}.defaultProps = {${slots.join(',\n')}}`
}
