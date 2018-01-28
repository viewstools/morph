import { getScopeDescription } from '../utils.js'

export const enter = key => (node, parent, state) => {
  if (node.name === 'Proxy') return

  let blockName = node.is || node.name

  if (typeof state.testIds[blockName] === 'number') {
    state.testIds[blockName]++
    blockName = `${blockName}:${state.testIds[blockName]}`
  } else {
    state.testIds[blockName] = 0
  }

  const scopes = node.scopes
    .filter(scope => !scope.isSystem)
    .map(scope => scope.value)
    .filter(Boolean)
    .reverse()

  let conditional = scopes.reduce(
    (prev, scope) => `${scope} ? '${getScopeDescription(scope)}' : ${prev}`,
    "''"
  )
  conditional = scopes.length > 0 ? `\${${conditional}}` : ''

  let value
  if (node.isBasic && parent) {
    value = `{\`${state.name}.${blockName}|${conditional}\`}`
  } else if (node.isBasic) {
    value = `{\`\${props['${key}'] || '${blockName}'}|${conditional}\`}`
  } else if (parent) {
    value = `"${state.name}.${blockName}"`
  } else {
    value = `{props["${key}"] || "${blockName}"}`
  }

  state.render.push(` ${key}=${value}`)
}
