const blacklist = ['isActive', 'teleportTo', 'goTo']
export default (node, parent) => !blacklist.includes(node.key.value)
