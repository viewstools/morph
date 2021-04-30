import { getImportNameForSource, getVariableName } from '../utils.js'

export function enter(node, parent, state) {
  if (
    !/^on[A-Z]/.test(node.name) ||
    node.name === 'onWhen' ||
    node.tags.slot ||
    typeof node.value !== 'string' ||
    !node.source
  ) {
    return
  }

  let importName = getImportNameForSource(node.source, state)
  // assuming it is a hook
  if (/^use[A-Z]/.test(node.value)) {
    let variableName = getVariableName(node.name, state)
    state.variables.push(
      `let ${variableName} = ${importName}.${node.value}(VIEW_PROPS)`
    )
    node.value = variableName
  } else {
    node.value = `${importName}.${node.value}`
  }
}
