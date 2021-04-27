import { singular } from 'pluralize'
import toSnakeCase from 'to-snake-case'
import {
  getProp,
  getDataForLoc,
  replacePropWithDataValue,
  isList,
} from '../utils.js'

let DATA_VALUE = /props\.value/

export function enter(node, parent, state) {
  if (!isList(node)) return

  let from = getProp(node, 'from')
  if (!from) return

  let value = from.value
  let data = getDataForLoc(node, from.loc)
  if (data && DATA_VALUE.test(value)) {
    value = replacePropWithDataValue(value, data)
  }

  state.render.push(
    `{Array.isArray(${value}) && ${value}.map((item, index, list) => `
  )

  if (state.viewPath) {
    let itemDataContextName =
      getProp(node, 'itemDataContextName') ||
      defaultItemDataContextName(node, from)
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

function defaultItemDataContextName(node, from) {
  let value
  let data = getDataForLoc(node, from.loc)
  if (data && DATA_VALUE.test(from.value)) {
    value = data.path.replace('.', '_')
  } else {
    value = from.value.replace('props.', '')
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
