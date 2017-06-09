const blacklist = [
  'backgroundImage',
  'backgroundSize',
  'cursor',
  'overflow',
  'overflowX',
  'overflowY',
  'fontWeight',
  'onClick',
  'pageBreakInside',
  'teleportTo',
  // TODO convert to upper case...
  'textTransform',
  'goTo',
]

// TODO whitelist instead

// TODO FIXME pass props to non basic blocks
export default (node, parent) => !blacklist.includes(node.key.value)
// !node.isBasic || (node.isBasic &&
