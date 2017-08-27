import morph from './morph.js'

export default ({ view }) => {
  const state = {}

  const visitors = {
    Property,
  }

  morph(view, state, visitors)

  return {
    code: `export default ${JSON.stringify(state.default || state)}`,
  }
}

const Property = {
  enter(node, parent, state) {
    state[node.key.value] = getValue(node)

    if (
      node.value.type === 'ArrayExpression' ||
      node.value.type === 'ObjectExpression'
    )
      this.skip()
  },
}

// TODO relations
// eg
// Data
// name Dario
// addresses
// from addresses.data
export const getValue = property => {
  switch (property.value.type) {
    case 'Literal':
      return property.value.value

    case 'ArrayExpression':
      return property.value.elements.map(getValue)

    case 'ObjectExpression':
      let value = {}

      property.value.properties.forEach(pr => {
        value[pr.key.value] = getValue(pr)
      })

      return value

    default:
      return null
  }
}
