import {
  asScopedValue,
  checkParentStem,
  getStyleType,
  isCode,
  isStyle,
} from '../utils.js'
import safe from './safe.js'

export function enter(node, parent, state) {
  let styleForProperty, isScopedVal, _isProp
  if (isStyle(node) && parent.isBasic && !parent.isSvg) {
    const code = isCode(node)

    if (parent.scoped.hasOwnProperty(node.name)) {
      isScopedVal = true

      styleForProperty = {
        [node.name]: asScopedValue(parent.scoped[node.name], node, parent),
      }
    } else {
      ;({ _isProp, ...styleForProperty } = state.getStyleForProperty(
        node,
        parent,
        code
      ))
    }

    if (_isProp) {
      Object.keys(styleForProperty).forEach(k =>
        state.render.push(` ${k}=${safe(styleForProperty[k], node)}`)
      )
    } else {
      const hasMatchingParent =
        parent && node.isDynamic
          ? checkParentStem(node, getStyleType(node))
          : false
      const target =
        code || isScopedVal || hasMatchingParent
          ? parent.style.dynamic
          : parent.style.static
      Object.assign(target[getStyleType(node)], styleForProperty)
    }

    return true
  }
}
