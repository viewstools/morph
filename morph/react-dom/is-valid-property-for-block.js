const blacklist = ['classname', 'isactive', 'teleportto', 'goto']
const blacklistDebug = ['autofocus', 'tabindex']

export default (node, parent, state) => {
  const key = node.key.value.toLowerCase()

  if (parent.parent.isCapture) {
    console.log(key, state.debug && blacklistDebug.includes(key))
  }

  if (blacklist.includes(key)) return false

  if (state.debug && blacklistDebug.includes(key)) return false

  return true
}
