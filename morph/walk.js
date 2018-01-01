export default function walk(ast, { enter, leave }, state) {
  visit(ast, null, enter, leave, state)
}

function visit(node, parent, enter, leave, state) {
  if (!node) return

  if (enter) {
    if (enter.some(fn => fn(node, parent, state))) return
  }

  if (Array.isArray(node.children)) {
    node.children.forEach(child => {
      child.parent = node
      visit(child, node, enter, leave, state)
    })
  }

  if (leave) {
    leave.forEach(fn => fn(node, parent, state))
  }
}
