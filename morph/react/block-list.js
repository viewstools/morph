import { singular } from 'pluralize'
import toSnakeCase from 'to-snake-case'
import { getProp, isList } from '../utils.js'

let DATA_VALUE = /props\.value/

export function enter(node, parent, state) {
  if (!isList(node)) return

  let from = getProp(node, 'from')
  if (!from) return

  let value = from.value
  if ((state.data || node.data) && DATA_VALUE.test(value)) {
    value = value.replace('props', node.data ? node.data.name : 'data')
  }

  state.render.push(
    `{Array.isArray(${value}) && ${value}.map((item, index, list) => `
  )

  if (state.viewPath) {
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

function defaultItemDataContextName(state, node, fromValue) {
  let value
  if ((state.data || node.data) && DATA_VALUE.test(fromValue)) {
    value = node.data
      ? node.data.path.replace('.', '_')
      : state.data.path.replace('.', '_')
  } else {
    value = fromValue.replace('props.', '')
  }
  let singularValue = singular(value)
  if (singularValue !== value) {
    value = singularValue
  } else {
    // assuming List blocks only have one child
    value = toSnakeCase(node.children[0].name)
  }

  return { value }
}
