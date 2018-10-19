import {
  checkParentStem,
  getProp,
  getStyleType,
  isSlot,
  isStyle,
  isSvg,
} from '../utils.js'
import safe from './safe.js'

export function enter(node, parent, state) {
  if (
    !isStyle(node) ||
    !parent.isBasic ||
    (isSvg(parent) && state.isReactNative) ||
    parent.name === 'SvgGroup'
  )
    return

  let code = isSlot(node)

  if (node.name === 'fontFamily' && !code && state.isReactNative) {
    code = isSlot(getProp(parent, 'fontWeight'))
  }

  const { _isProp, _isScoped, ...styleForProperty } = state.getStyleForProperty(
    node,
    parent,
    code
  )

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
      code || _isScoped || hasMatchingParent
        ? parent.style.dynamic
        : parent.style.static
    Object.assign(target[getStyleType(node)], styleForProperty)
  }

  return true
}
