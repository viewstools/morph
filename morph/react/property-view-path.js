export function enter(node, parent, state) {
  if (node.isBasic || !state.viewPath || node.skipViewPath) return

  state.render.push(`  viewPath={\`\${props.viewPath}/${node.name}\`}`)
}
