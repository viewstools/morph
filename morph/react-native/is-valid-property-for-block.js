const blacklist = [
  'appRegion',
  'backgroundImage',
  'backgroundSize',
  'clipPath',
  'cursor',
  'isActive',
  'isDisabled',
  'goTo',
  'overflow',
  'overflowX',
  'overflowY',
  'fontWeight',
  'onClick',
  'onSubmit',
  'pageBreakInside',
  'teleportTo',
  // TODO convert to upper case...
  'textTransform',
  'userSelect',
]

// TODO whitelist instead
export default (node, parent) => !blacklist.includes(node.key.value)
