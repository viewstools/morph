const blacklist = [
  'backgroundImage',
  'backgroundSize',
  'cursor',
  'isActive',
  'goTo',
  'overflow',
  'overflowX',
  'overflowY',
  'fontWeight',
  'onClick',
  'pageBreakInside',
  'teleportTo',
  // TODO convert to upper case...
  'textTransform',
]

// TODO whitelist instead
export default (node, parent) => !blacklist.includes(node.key.value)
