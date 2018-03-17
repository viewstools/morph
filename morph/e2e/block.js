import { getScopeDescription } from '../utils.js'

export const enter = [
  (node, parent, state) => {
    if (node.name === 'Proxy') return

    let blockName = node.is || node.name

    if (typeof state.testIds[blockName] === 'number') {
      state.testIds[blockName]++
      blockName = `${blockName}:${state.testIds[blockName]}`
    } else {
      state.testIds[blockName] = 0
    }

    let scopes = node.scopes
      .filter(scope => !scope.isSystem)
      .map(scope => getScopeDescription(scope.value))
      .filter(Boolean)
      .reverse()

    if (!node.isBasic) {
      const groupView =
        state.views[node.name] && state.views[node.name].views[0]

      if (groupView && groupView.scopes.length > 0) {
        let groupScopes = groupView.scopes
          .filter(scope => !scope.isSystem)
          .map(scope => getScopeDescription(scope.value))
          .filter(Boolean)
          .reverse()

        scopes = [...scopes, ...groupScopes]
      }
    }

    let component = []

    if (!parent) {
      component.push(`_top: get('${blockName}'`)
    } else {
      component.push(
        `${blockName.replace(':', '')}: get('${state.name}.${blockName}'`
      )
    }

    scopes.forEach(function(scope) {
      component.push(`, '${scope}'`)
    })

    component.push(`),`)

    state.render.push(component.join(''))
  },
]

export const leave = []
