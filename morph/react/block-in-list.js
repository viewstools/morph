import { getProp, isList } from '../utils.js'

export function enter(node, parent, state) {
  if (!isList(parent)) return

  state.render.push(
    ` index={index} indexReverse={list.length - index} isFirst={index === 0} isLast={index === list.length - 1}`
  )

  state.render.push(` {...item} item={item}`)

  if (state.viewPath) {
    state.render.push(
      ` viewPath={\`$\{props.viewPath}/${node.name}($\{item.id || index})\`}`
    )
    node.skipViewPath = true
  }

  let key = getProp(node, 'key')
  state.render.push(` key={${key ? key.value : 'item.id || index'}}`)
}
