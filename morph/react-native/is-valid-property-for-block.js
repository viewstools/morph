const blacklist = [
  'appregion',
  'backgroundimage',
  'backgroundsize',
  'classname',
  'clippath',
  'cursor',
  'isdisabled',
  'goto',
  'overflow',
  'overflowx',
  'overflowy',
  'fontweight',
  'onclick',
  'onsubmit',
  'pagebreakinside',
  'teleportto',
  // todo convert to upper case...
  'texttransform',
  'userselect',
]

export default (node, parent, state) =>
  !blacklist.includes(node.key.value.toLowerCase())
