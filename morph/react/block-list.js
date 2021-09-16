import { singular } from 'pluralize'
import toSnakeCase from 'to-snake-case'
import {
  getProp,
  getDataForLoc,
  replacePropWithDataValue,
  isList,
  hasProp,
  getListItemKey,
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

  let stream = getProp(node, 'stream')
  if (stream?.value) {
    state.use('ViewsUseStream')
    state.render.push(`<ViewsStream`)

    let every = null
    let pinToBottom = false
    if (typeof stream.value === 'number') {
      every = stream.value
    } else if (typeof stream.value !== 'boolean') {
      ;[, every, pinToBottom] = stream.value.match(
        /^([0-9]+)?(\s*pinToBottom)?$/
      )
      every = Number(every)
      pinToBottom = !!pinToBottom
    }

    if (every) {
      state.render.push(` every={${every}}`)
    }
    if (pinToBottom) {
      state.render.push(` pinToBottom`)
    }

    state.render.push('>')
  }

  state.render.push(
    `{Array.isArray(${value}) && ${value}.map((item, index, list) => {`
  )

  if (state.viewPath) {
    let itemDataContextName =
      getProp(node, 'itemDataContextName') ||
      defaultItemDataContextName(node, from)
    let key
    if (hasProp(node, 'itemKey')) {
      key = getListItemKey(node)
    } else {
      key = `item?.id || index`

      if (state.tools) {
        state.render.push(`
          if (process.env.NODE_ENV === 'development') {
            if(!item?.id) {
              console.debug({
                type: 'views/data',
                warning: \`Missing "id" property on the item $\{JSON.stringify(item)} in context "${itemDataContextName.value}" so the index in the list will be used as a fallback key. Consider setting "itemKey" if the item has a custom or compound key e.g.  first_name,last_name.\`,
              })
            }
          }`)
      }
    }

    state.render.push(
      `return <ListItem
        key={${key}}
        context="${itemDataContextName.value}"
        item={item}
        index={index}
        list={list}
        viewPath={\`$\{props.viewPath}/${node.children[0].name}($\{${key}})\`}
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
  state.render.push('})}')

  if (getProp(node, 'stream')?.value) {
    state.render.push(`</ViewsStream>`)
  }
}

function defaultItemDataContextName(node, from) {
  let value
  let data = getDataForLoc(node, from.loc)
  if (data && DATA_VALUE.test(from.value)) {
    value = [data.context, data.path]
      .filter(Boolean)
      .join('_')
      .replace('.', '_')
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
