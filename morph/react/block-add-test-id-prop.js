export let enter = (node, parent, state) => {
  if (node.isFragment) return

  let value
  if (parent) {
    value = `"${state.name}.${node.testId}"`
  } else {
    value = `{\`${state.testIdKeyAsProp} || '${node.testId}'}\`}`
  }

  state.render.push(`  ${state.testIdKey}=${value}`)
}
