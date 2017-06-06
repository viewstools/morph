import parse from './parse/index.js'
import walk from './walk.js'

export default ({ view }) => {
  // because the walker mutates the AST, we need to get a new one each time
  // get the names first
  const names = parse(view).views.map((view, index) => {
    let name

    walk(view, {
      enter(node, parent) {
        if (node.type === 'Block') {
          name = node.is || `Test${index}`
        }
      },
    })

    return name
  })

  // then the tests
  const tests = parse(view).views.map((view, index) => {
    const test = {}
    let name

    walk(view, {
      enter(node, parent) {
        if (node.type === 'Block') {
          name = node.is || `Test${index}`
        } else if (node.type === 'Property') {
          test[node.key.value] = getValue(node, names)

          if (
            node.value.type === 'ArrayExpression' ||
            node.value.type === 'ObjectExpression'
          )
            this.skip()
        }
      },
    })

    return {
      name,
      test,
    }
  })

  const body = tests
    .map(({ name, test }, index) => {
      // every test after the first one inherits the first one
      const data = index > 0
        ? {
            ...tests[0].test,
            ...test,
          }
        : test

      return `const ${name} = ${JSON.stringify(data)}`
    })
    .join('\n')

  return `export default display => {
    ${body.replace(/"?<<DISPLAY>>"?/g, '')}
    return { _main: '${names[0]}', ${names.join(',')} }
  }`
}

// TODO embed data
// Test
// name Dario
// addresses
// from addresses.data
export const getValue = (property, tests) => {
  switch (property.value.type) {
    case 'Literal':
      const v = property.value.value
      return tests.includes(v) ? `<<DISPLAY>>() => display(${v})<<DISPLAY>>` : v

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
