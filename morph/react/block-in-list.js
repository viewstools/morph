import { getListItemKey, getProp, hasProp, isList } from '../utils.js'

export function enter(node, parent, state) {
  if (!isList(parent)) return

  state.render.push(
    ` index={index} indexReverse={list.length - index} isFirst={index === 0} isLast={index === list.length - 1}`
  )

  state.render.push(` item={item}`)

  if (state.viewPath) {
    let key = hasProp(parent, 'itemKey')
      ? getListItemKey(parent)
      : `item?.id || index`

    state.render.push(
      ` viewPath={\`$\{props.viewPath}/${node.name}($\{${key}})\`}`
    )
    node.skipViewPath = true
  }

  if (!state.hasListItem) {
    let key = getProp(node, 'key')
    state.render.push(` key={${key ? key.value : 'item?.id || index'}}`)
  }
}
