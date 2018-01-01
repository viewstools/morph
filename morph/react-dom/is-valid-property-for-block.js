const blacklist = ['classname', 'teleportto', 'goto']
const blacklistDebug = ['autofocus', 'tabindex']

export default (node, parent, state) => {
  const name = node.name.toLowerCase()

  return !(
    blacklist.includes(name) ||
    (state.debug && blacklistDebug.includes(name))
  )
}
