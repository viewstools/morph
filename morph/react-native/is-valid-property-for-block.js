let blacklist = [
  'appregion',
  'backgroundimage',
  'backgroundsize',
  'classname',
  'clippath',
  'cursor',
  'fontweight',
  'format',
  'goto',
  'isdisabled',
  'isfragment',
  'onclickusediv',
  'onsubmit',
  'overflow',
  'overflowx',
  'overflowy',
  'pagebreakinside',
  'perspective',
  'rotatez',
  'scalez',
  'shadowspread',
  'teleportto',
  'texttransform',
  'transformorigin',
  'transformoriginz',
  'transition',
  'translatez',
  'type',
  'userselect',
]

export default (node, parent, state) =>
  !blacklist.includes(node.name.toLowerCase())
