const blacklist = [
  'appRegion',
  'backgroundImage',
  'backgroundSize',
  'clipPath',
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
  'userSelect',
]

// TODO whitelist instead
export default (node, parent) => !blacklist.includes(node.key.value)
