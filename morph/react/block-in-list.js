import { getProp, isList } from '../utils.js'

let DATA_VALUE = /props\.value/

export function enter(node, parent, state) {
  if (!isList(parent)) return

  state.render.push(
    ` index={index} indexReverse={list.length - index} isFirst={index === 0} isLast={index === list.length - 1}`
  )

  let from = getProp(parent, 'from')
  let pass = getProp(parent, 'pass')
  if (state.data && DATA_VALUE.test(from.value)) {
    state.render.push(
      ` item={item} viewPath={\`$\{props.viewPath}/${node.name}($\{item.id || index})\`}`
    )
    node.skipViewPath = true
  } else if (pass) {
    state.render.push(` ${pass.value}={${pass.value}}`)
  } else {
    state.render.push(' {...item}')
  }

  let key = getProp(node, 'key')
  state.render.push(` key={${key ? key.value : 'item.id || index'}}`)
}
