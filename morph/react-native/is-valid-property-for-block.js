const blacklist = [
  'backgroundImage',
  'backgroundSize',
  'overflow',
  'overflowX',
  'overflowY',
  'fontWeight',
  'onClick',
  'teleportTo',
  'goTo',
]

// TODO FIXME pass props to non basic blocks
export default (node, parent) => !blacklist.includes(node.key.value)
// !node.isBasic || (node.isBasic &&
