export function enter(node, parent, state) {
  if (node.isBasic || !state.pathToStory) return

  // this is something we may use when going into dynamic paths through data
  // state.render.push(`viewPath={\`\${props.viewPath}/${state.name}\`}`)
  state.render.push(`viewPath="${state.pathToStory}/${node.name}"`)
}
