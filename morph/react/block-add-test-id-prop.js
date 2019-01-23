import { getScopeDescription } from '../utils.js'

export const enter = (node, parent, state) => {
  if (node.name === 'Proxy' || node.isFragment) return

  const scopes = node.scopes
    .filter(scope => !scope.isSystem && !scope.isLocal)
    .map(scope => scope.value)
    .filter(Boolean)
    .reverse()

  let conditional = scopes.reduce(
    (prev, scope) => `${scope} ? '${getScopeDescription(scope)}|' : ${prev}`,
    "''"
  )
  conditional = scopes.length > 0 ? `\${${conditional}}` : ''

  let value
  if (parent) {
    value = `{\`${state.name}.${node.testId}|${conditional}\`}`
  } else {
    value = `{\`\${props['${state.testIdKey}'] || '${
      node.testId
    }'}|${conditional}\`}`
  }

  state.render.push(` ${state.testIdKey}=${value}`)
}
