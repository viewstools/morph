import {
  getLocalsString,
  getScopedCondition,
  hasCustomScopes,
  hasLocals,
  interpolateText,
  isSlot,
} from '../utils.js'
import safe from './safe.js'
import wrap from './wrap.js'

const parseFormatValue = (value, type) => {
  switch (type) {
    case 'percent':
      return value / 100
    case 'date':
      return `Date.parse('${value}')`
    case 'time':
      const timeValues = value.split(':')
      let timeStr = `Date.UTC(2018, 14, 3`
      // parseInt to remove leading zeroes, it isn't a valid number otherwise
      timeValues.forEach(val => (timeStr += `, ${parseInt(val, 10)}`))
      return `${timeStr})`
    default:
      return value
  }
}

export function enter(node, parent, state) {
  if (node.name === 'text' && parent.name === 'Text') {
    if (hasCustomScopes(node, parent)) {
      parent.explicitChildren = wrap(getScopedCondition(node, parent))
    } else if (isSlot(node)) {
      parent.explicitChildren = wrap(node.value)
    } else if (hasLocals(node, parent)) {
      // const baseLocalName = `${parent.is || parent.name}Local`
      // let localName = baseLocalName
      // let index = 1
      // while (localName in state.locals) {
      //   localName = `${baseLocalName}${index++}`
      // }

      // state.locals[localName] = getLocals(node, parent, state)
      // parent.explicitChildren = wrap(
      //   `${localName}[local.state.lang] || ${safe(node.value)}`
      // )

      parent.explicitChildren = getLocalsString(node, parent, state)
    } else if (parent.hasOwnProperty('format')) {
      const type = Object.keys(parent.format)[0]
      parent.explicitChildren = `{${type}Formatters[local.state.lang].format(${parseFormatValue(
        node.value,
        type
      )})}`
    } else if (parent.hasOwnProperty('interpolation')) {
      parent.explicitChildren = interpolateText(node, parent)
    } else {
      parent.explicitChildren = node.value
    }

    return true
  }
}
