const blacklist = [
  'appregion',
  'backgroundimage',
  'backgroundsize',
  'classname',
  'clippath',
  'cursor',
  'format',
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
  'userselect',
]

export default (node, parent, state) =>
  !blacklist.includes(node.name.toLowerCase())
