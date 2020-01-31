import {
  getLocalsString,
  getScopedCondition,
  hasCustomScopes,
  hasLocals,
  isSlot,
} from '../utils.js'
import wrap from './wrap.js'

let parseFormatValue = (value, type) => {
  switch (type) {
    case 'percent':
      return value / 100
    case 'date':
      return `Date.parse('${value}')`
    case 'time':
      let timeValues = value.split(':')
      let timeStr = `Date.UTC(2018, 14, 3`
      // parseInt to remove leading zeroes, it isn't a valid number otherwise
      timeValues.forEach(val => (timeStr += `, ${parseInt(val, 10)}`))
      return `${timeStr})`
    default:
      return value
  }
}

let HAS_RESTRICTED_CHARACTERS = /[{}<>/]/

export function enter(node, parent, state) {
  if (node.name === 'text' && parent.name === 'Text') {
    if (state.data && node.value === 'props.value') {
      parent.explicitChildren = '{data.value}'
    } else if (hasCustomScopes(node, parent)) {
      parent.explicitChildren = wrap(getScopedCondition(node, parent, state))
    } else if (isSlot(node)) {
      parent.explicitChildren = wrap(node.value)
    } else if (hasLocals(node, parent)) {
      parent.explicitChildren = getLocalsString(node, parent, state)
    } else if (parent.hasOwnProperty('format')) {
      let type = Object.keys(parent.format)[0]
      parent.explicitChildren = `{${type}Formatters[local.state.lang].format(${parseFormatValue(
        node.value,
        type
      )})}`
    } else if (HAS_RESTRICTED_CHARACTERS.test(node.value)) {
      parent.explicitChildren = `{"${node.value}"}`
    } else {
      parent.explicitChildren = node.value
    }

    return true
  }
}
