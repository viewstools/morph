import {
  checkParentStem,
  getScopedCondition,
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

  let styleForProperty, isScopedVal, _isProp

  const code = isSlot(node)

  // TODO refactor
  if (getScopedCondition(node, parent)) {
    isScopedVal = true

    styleForProperty = {
      [node.name]: getScopedCondition(node, parent),
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
