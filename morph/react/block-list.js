import { singular } from 'pluralize'
import toSnakeCase from 'to-snake-case'
import { getProp, isList } from '../utils.js'

let DATA_VALUE = /props\.value/

export function enter(node, parent, state) {
  if (!isList(node)) return

  let from = getProp(node, 'from')
  if (!from) return

  let value = from.value
  if (state.data && DATA_VALUE.test(value)) {
    value = value.replace('props', 'data')
  }

  state.render.push(
    `{Array.isArray(${value}) && ${value}.map((item, index, list) => `
  )

  if (parent.viewPath) {
    let itemDataContextName =
      getProp(node, 'itemDataContextName') ||
      defaultItemDataContextName(state, node, from.value)
    state.render.push(
      `<ListItem
        key={item.id || index}
        context="${itemDataContextName.value}"
        item={item}
        index={index}
        list={list}
        viewPath={viewPath}
      >`
    )
  }
}

export function leave(node, parent, state) {
  if (!isList(node)) return

  if (parent.viewPath) {
    state.render.push('</ListItem>')
  }
  state.render.push(')}')
}

function defaultItemDataContextName(state, node, fromValue) {
  let value =
    state.data && DATA_VALUE.test(fromValue)
      ? state.data.path.replace('.', '_')
      : fromValue.replace('props.', '')
  let singularValue = singular(value)
  if (singularValue !== value) {
    value = singularValue
  } else {
    // assuming List blocks only have one child
    value = toSnakeCase(node.children[0].name)
  }

  return { value }
}
