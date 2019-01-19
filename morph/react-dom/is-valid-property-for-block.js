const blacklist = [
  'classname',
  'format',
  'goto',
  'isfragment',
  'perspective',
  'rotatez',
  'scalex',
  'scaley',
  'scalez',
  'teleportto',
  'transformoriginz',
  'translatez',
]

export default (node, parent, state) =>
  !blacklist.includes(node.name.toLowerCase())
