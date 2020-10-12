export function enter(node, parent, state) {
  if (node.isBasic || !state.viewPath) return

  // this is something we may use when going into dynamic paths through data
  state.render.push(`viewPath={\`\${props.viewPath}/${node.name}\`}`)
  // state.render.push(`viewPath="${state.viewPath}/${node.name}"`)
}
