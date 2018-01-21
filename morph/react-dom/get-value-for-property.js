import { getScopedCondition, getScopedProps, isValidImgSrc } from '../utils.js'
import safe from '../react/safe.js'
import wrap from '../react/wrap.js'
import toCamelCase from 'to-camel-case'

const isUrl = str => /^https?:\/\//.test(str)

const getImageSource = (node, state, parent) => {
  debugger
  if (getScopedProps(node, parent) && (isUrl(node.value) || node.tags.code)) {
    return wrap(getScopedCondition(node, parent))
  } else if (isUrl(node.value) || node.tags.code) {
    return safe(node.value)
  } else {
    if (state.debug) {
      return `{requireImage("${node.value}")}`
    } else {
      let scopedNames
      if (getScopedProps(node, parent)) {
        const scopedValues = getScopedProps(node, parent)
        const paths = scopedValues.map(scope => scope.prop.value)
        scopedNames = paths.map(path => toCamelCase(path))
        //scopedValues.map(scope => toCamelCase(scope.prop.value))
        debugger
        //const name = toCamelCase(node.value)
        scopedNames.forEach(name => {
          debugger
          const path = paths[scopedNames.findIndex(item => item === name)]
          if (!state.images.includes(path)) {
            state.images.push({
              name,
              file: path,
            })
          }
          // return `{${name}}`
        })
      } // else {
      debugger
      const defaultName = toCamelCase(node.value)
      if (!state.images.includes(node.value)) {
        state.images.push({
          defaultName,
          file: node.value,
        })
      }
      //return `{${defaultName}, ${scopedNames[0]}}`
      return wrap(getScopedCondition(node, parent))
    }
  }
}

export default (node, parent, state) => {
  debugger
  if (isValidImgSrc(node, parent)) {
    return {
      src: getImageSource(node, state, parent),
    }
  } else if (parent.isBasic && node.name === 'isDisabled') {
    return {
      disabled: safe(node.value, node),
    }
  } else if (getScopedCondition(node, parent)) {
    return {
      [node.name]: safe(getScopedCondition(node, parent)),
    }
  } else {
    return {
      [node.name]: safe(node.value, node),
    }
  }
}
