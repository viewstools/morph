import fs from 'fs'
import parse from '../parse/index.js'
import path from 'path'
import walk from './walk.js'

export default ({ file, view }) => {
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
    let resource = false

    walk(view, {
      enter(node, parent) {
        if (node.type === 'Block') {
          name = node.is || `Test${index}`
        } else if (node.type === 'Property') {
          if (node.key.value === 'from') {
            const resourceFile = path.resolve(
              path.dirname(file.raw),
              getValue(node, names)
            )

            if (fs.existsSync(resourceFile)) {
              resource = fs.readFileSync(resourceFile, 'utf8')
            }
            // const importStatement = `import ${resource} from '${file}'`

            // if (!imports.includes(importStatement)) {
            //   imports.push(importStatement)
            // }
          } else {
            test[node.key.value] = getValue(node, names)
          }

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
      resource,
      test,
    }
  })

  const body = tests
    .map(({ name, resource, test }, index) => {
      // every test after the first one inherits the first one
      const data =
        index > 0
          ? {
              ...tests[0].test,
              ...test,
            }
          : test

      const code = [`const ${name} = `]

      if (resource) {
        code.push(`Object.assign(`)
      }

      code.push(JSON.stringify(data))

      if (resource) {
        code.push(`, ${resource})`)
      }

      return code.join(' ')
    })
    .join('\n')

  return {
    code: `
  export const names = ${JSON.stringify(names)}

  export const make = display => {
  ${body.replace(/"?<<DISPLAY>>"?/g, '')}
  return { _main: '${names[0]}', ${names.join(',')} }
}`,
  }
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
      return tests.includes(v)
        ? `<<DISPLAY>>() => display(${v}, '${v}')<<DISPLAY>>`
        : v

    case 'ArrayExpression':
      return property.value.elements.map(v => getValue(v, tests))

    case 'ObjectExpression':
      let value = {}

      property.value.properties.forEach(pr => {
        value[pr.key.value] = getValue(pr, tests)
      })

      return value

    default:
      return null
  }
}
