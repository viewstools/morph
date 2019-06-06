export function enter(node, parent, state) {
  if (!node.action || 'userSelect' in node.style.static.base) return

  node.style.static.base.userSelect = 'none'
}
