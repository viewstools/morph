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

export default (node, parent, state) =>
  !blacklist.includes(node.name.toLowerCase())
