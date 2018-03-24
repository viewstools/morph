const blacklist = [
  'appregion',
  'backgroundimage',
  'backgroundsize',
  'classname',
  'clippath',
  'cursor',
  'fontweight',
  'goto',
  'isdisabled',
  'onclick',
  'onsubmit',
  'overflow',
  'overflowx',
  'overflowy',
  'pagebreakinside',
  'shadowspread',
  'teleportto',
  'texttransform',
  'transition',
  'transformorigin',
  'userselect',
]

export default (node, parent, state) =>
  !blacklist.includes(node.name.toLowerCase())
