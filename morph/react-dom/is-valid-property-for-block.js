const blacklist = ['backgroundSize', 'teleportTo', 'goTo', 'isActive']
export default (node, parent) => !blacklist.includes(node.key.value)
