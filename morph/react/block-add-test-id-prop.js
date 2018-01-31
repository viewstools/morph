import { getScopeDescription } from '../utils.js'

export const enter = (node, parent, state) => {
  if (node.name === 'Proxy') return

  const scopes = node.scopes
    .filter(scope => !scope.isSystem)
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
