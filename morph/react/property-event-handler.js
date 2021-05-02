import { getImportNameForSource, getVariableName } from '../utils.js'
import getExpandedProps from './get-expanded-props.js'

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
    let expandedProps = getExpandedProps({ state, ignoreDefaultValues: true })
    let variableName = getVariableName(node.name, state)
    state.variables.push(
      `let ${variableName} = ${importName}.${node.value}(${expandedProps})`
    )
    node.value = variableName
  } else {
    node.value = `${importName}.${node.value}`
  }
}
