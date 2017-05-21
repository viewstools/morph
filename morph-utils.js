export const hasProp = (node, key, match) => {
  const prop = node.properties.list.find(p => p.key.value === key)
  if (!prop) return false
  return typeof match === 'function' ? match(prop.value.value) : true
}
