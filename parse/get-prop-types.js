import isNumber from './prop-is-number.js'

const isActionable = item =>
  // (item.type === 'Horizontal' ||
  //   item.type === 'Vertical' ||
  //   /^Capture/.test(item.type)) &&
  /^on[A-Z]/.test(item.name)

const extractPropsAndItems = item => {
  const props = []
  const regex = /(props|item)\.([a-zA-Z][a-zA-Z0-9.]*[a-zA-Z0-9]+)(.)?/g

  let matches = regex.exec(item.value)
  while (matches !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (matches.index === regex.lastIndex) {
      regex.lastIndex++
    }

    const isExplicitFunctionCall = matches[3] === '('
    props.push({
      isItem: matches[1] === 'item',
      path: matches[2],
      type:
        isActionable(item) || isExplicitFunctionCall
          ? 'function'
          : isNumber[item.name] ? 'number' : 'string',
    })
    matches = regex.exec(item.value)
  }
  return props
}

const isList = item => item.type === 'List'
const isListFrom = item => item.name === 'from' && isList(item)

export default list => {
  const flatProps = {}

  let listFromPath
  list.forEach((item, index) => {
    extractPropsAndItems(item).forEach(propOrItem => {
      if (isListFrom(item)) {
        // store the list prop path for later
        listFromPath = propOrItem.path
      } else if (isList(item) && propOrItem.path.endsWith('.length')) {
        // skip array length checks in list
        return
      }

      if (propOrItem.isItem) {
        // if we didn't find a list, don't include item props
        if (!listFromPath) return

        propOrItem.path = `${listFromPath}.${propOrItem.path}`
      }

      flatProps[propOrItem.path] = propOrItem
    })
  })

  const props = {}

  Object.keys(flatProps)
    .sort()
    .forEach(key => {
      const prop = flatProps[key]

      if (key.includes('.')) {
        const [main, ...rest] = key.split('.')
        let ref = props[main]
        if (!ref || typeof ref === 'string') {
          ref = props[main] = {
            type: prop.isItem ? 'array' : 'object',
            shape: {},
          }
        }

        // TODO support any nesting
        rest.forEach(part => {
          ref.shape[part] = prop.type
        })
      } else {
        props[key] = prop.type
      }
    })

  return props
}
