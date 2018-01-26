import toCamelCase from 'to-camel-case'
import toSlugCase from 'to-slug-case'

export const enter = key => (node, parent, state) => {
  if (node.name === 'Proxy') return

  const scopes = node.scopes
    .filter(scope => !scope.isSystem)
    .map(scope => {
      return scope.value
    })
    .filter(Boolean)
    .reverse()

  let blockName = node.is || node.name

  if (typeof state.testIds[blockName] === 'number') {
    state.testIds[blockName]++
    blockName = `${blockName}:${state.testIds[blockName]}`
  } else {
    state.testIds[blockName] = 0
  }

  let conditional = `''`
  scopes.forEach(scope => {
    let s = toSlugCase(scope.replace('!', 'not-'))
    s = s.replace(/props./g, '')
    s = toCamelCase(s)
    conditional = `${scope} ? '${s}' : ` + conditional
  })

  if (node.isBasic) {
    if (parent) {
      state.render.push(
        ` ${key}={"${state.name}.${blockName}|" + (${conditional})}`
      )
    } else {
      state.render.push(
        ` ${key}={(props["${key}"] || "${blockName}") + '|' + (${conditional})}`
      )
    }
  } else {
    if (parent) {
      state.render.push(` ${key}="${state.name}.${blockName}"`)
    } else {
      state.render.push(` ${key}={props["${key}"] || "${blockName}"}`)
    }
  }
}
