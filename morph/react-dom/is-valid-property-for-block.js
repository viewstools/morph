const blacklist = [
  'classname',
  'format',
  'teleportto',
  'goto',
  'translatez',
  'scalex',
  'scaley',
  'scalez',
  'rotatez',
  'transformoriginz',
  'perspective',
]
const blacklistDebug = ['autofocus', 'tabindex']

export default (node, parent, state) => {
  const name = node.name.toLowerCase()

  return !(
    blacklist.includes(name) ||
    (state.debug && blacklistDebug.includes(name))
  )
}
