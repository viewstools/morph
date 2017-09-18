export const enter = key => (node, parent, state) => {
  if (node.name.value !== 'Proxy' && (node.is || !node.isBasic)) {
    const blockName = node.is || node.name.value
    const testId = parent ? `${state.name}.${blockName}` : blockName

    state.render.push(` ${key}="${testId}"`)
  }
}
