const blacklist = ['classname', 'teleportto', 'goto']
const blacklistDebug = ['autofocus', 'tabindex']

export default (node, parent, state) => {
  const key = node.key.value.toLowerCase()

  return !(
    blacklist.includes(key) ||
    (state.debug && blacklistDebug.includes(key))
  )
}
