import fs from 'fs'
import parse from '../parse/index.js'
import path from 'path'

export const EMPTY_TEST = 'Main Test'

export default ({ file, view }) => {
  const tests = parse(view).views.map((node, index) => {
    const test = {}
    const name = node.is || `Test${index}`
    let resource = false

    Array.isArray(node.properties) &&
      node.properties.forEach(propNode => {
        if (propNode.name === 'from') {
          if (typeof propNode.value === 'number') {
            const list = []
            for (let id = 0; id < propNode.value; id++) {
              list.push({ id })
            }
            test[propNode.name] = list
          } else {
            const resourceFile = path.resolve(
              path.dirname(file.raw),
              propNode.value
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
          test[propNode.name] = propNode.value
        }
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
