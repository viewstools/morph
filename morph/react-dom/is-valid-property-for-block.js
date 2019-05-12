let blacklist = [
  'classname',
  'format',
  'goto',
  'isfragment',
  'onclickid',
  'onclickselected',
  'onclickselectedtype',
  'onclickusediv',
  'perspective',
  'rotatez',
  'scalez',
  'teleportto',
  'transformoriginz',
  'translatez',
  'type',
]

export default (node, parent, state) =>
  !blacklist.includes(node.name.toLowerCase())
