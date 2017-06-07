const blacklist = ['backgroundSize', 'teleportTo', 'goTo']
export default (node, parent) => !blacklist.includes(node.key.value)
