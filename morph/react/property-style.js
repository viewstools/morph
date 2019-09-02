import {
  checkParentStem,
  getProp,
  getStyleType,
  isSlot,
  isStyle,
  isSvg,
} from '../utils.js'
import safe from './safe.js'

let PROPS_THAT_IMPLY_CODE_FOR_OTHERS = {
  fontFamily: 'fontWeight',
  shadowOffsetX: 'shadowOffsetY',
  shadowOffsetY: 'shadowOffsetX',
}

export function enter(node, parent, state) {
  if (
    !isStyle(node) ||
    !parent.isBasic ||
    (isSvg(parent) && state.isReactNative) ||
    parent.name === 'SvgGroup'
  )
    return

  let code = isSlot(node)

  if (!code && state.isReactNative) {
    let otherProp = PROPS_THAT_IMPLY_CODE_FOR_OTHERS[node.name]
    if (otherProp) {
      code = isSlot(getProp(parent, otherProp))
    }
  }

  let { _isProp, _isScoped, ...styleForProperty } = state.getStyleForProperty(
    node,
    parent,
    code
  )

  if (_isProp) {
    Object.keys(styleForProperty).forEach(k =>
      state.render.push(` ${k}=${safe(styleForProperty[k], node)}`)
    )
  } else {
    let hasMatchingParent =
      parent && node.isDynamic
        ? checkParentStem(node, getStyleType(node))
        : false
    let target =
      code || _isScoped || hasMatchingParent
        ? parent.style.dynamic
        : parent.style.static

    Object.assign(target[getStyleType(node)], styleForProperty)
  }

  return true
}
