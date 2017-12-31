import fs from 'fs'
import parse from '../parse/index.js'
import path from 'path'
import walk from './walk.js'

export const EMPTY_TEST = 'Main Test'

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
            if (typeof node.value.value === 'number') {
              const list = []
              for (let id = 0; id < node.value.value; id++) {
                list.push({ id })
              }
              test[node.key.value] = list
            } else {
              const resourceFile = path.resolve(
                path.dirname(file.raw),
                getValue(node, names)
              )

              if (fs.existsSync(resourceFile)) {
                try {
                  resource = JSON.parse(fs.readFileSync(resourceFile, 'utf8'))
                } catch (error) {
                  console.error(
                    `${file}: Can't parse resource ${resourceFile}`,
                    error
                  )
                }
              }
            }
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

  return tests.map(({ name, resource, test }, index) => {
    // every test after the first one inherits the first one
    let data =
      index > 0
        ? {
            ...tests[0].test,
            ...test,
          }
        : test

    if (resource) {
      data = {
        ...data,
        ...resource,
      }
    }

    return {
      name,
      data,
    }
  })
}

export const getValue = (property, tests) => {
  switch (property.value.type) {
    case 'Literal':
      return property.value.value

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
