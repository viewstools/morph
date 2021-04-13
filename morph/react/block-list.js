import { singular } from 'pluralize'
import toSnakeCase from 'to-snake-case'
import { getProp, isList } from '../utils.js'

let DATA_VALUE = /props\.value/

export function enter(node, parent, state) {
  if (!isList(node)) return

  let from = getProp(node, 'from')
  if (!from) return

  let value = from.value
  if (node.data && DATA_VALUE.test(value)) {
    value = value.replace('props', node.data.name)
  }

  state.render.push(
    `{Array.isArray(${value}) && ${value}.map((item, index, list) => `
  )

  if (state.viewPath) {
    let itemDataContextName =
      getProp(node, 'itemDataContextName') ||
      defaultItemDataContextName(node, from.value)
    state.render.push(
      `<ListItem
        key={item.id || index}
        context="${itemDataContextName.value}"
        item={item}
        index={index}
        list={list}
        viewPath={\`$\{props.viewPath}/${node.children[0].name}($\{item.id || index})\`}
      >`
    )

    node.children[0].skipViewPath = true
    state.hasListItem = true
    state.use('ViewsUseData')
  }
}

export function leave(node, parent, state) {
  if (!isList(node)) return

  if (state.viewPath) {
    state.render.push('</ListItem>')
  }
  state.render.push(')}')
}

function defaultItemDataContextName(node, fromValue) {
  let value =
    node.data && DATA_VALUE.test(fromValue)
      ? node.data.path.replace('.', '_')
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
