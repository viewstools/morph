export const enter = key => (node, parent, state) => {
  if (node.name === 'Proxy') return

  let blockName = node.is || node.name

  if (typeof state.testIds[blockName] === 'number') {
    state.testIds[blockName]++
    blockName = `${blockName}:${state.testIds[blockName]}`
  } else {
    state.testIds[blockName] = 0
  }

  if (parent) {
    state.render.push(` ${key}="${state.name}.${blockName}"`)
  } else {
    state.render.push(` ${key}={props["${key}"] || "${blockName}"}`)
  }
}
