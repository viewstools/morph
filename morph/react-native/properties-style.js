import { enter } from '../react/properties-style.js'
import {
  createId,
  getAnimatedStyles,
  getObjectAsString,
  hasAnimatedChild,
  // TODO: Think of a better name 🙈
  getNonAnimatedDynamicStyles,
  hasPaddingProp,
  getPaddingProps,
  removePaddingProps,
  hasKeys,
} from '../utils.js'

export { enter }

export const leave = (node, parent, state) => {
  const dynamicStyles = getNonAnimatedDynamicStyles(node)
  let style = null
  let containerStyle = null

  debugger

  if (
    node.ensureBackgroundColor &&
    (!('backgroundColor' in node.style.static.base) ||
      !('backgroundColor' in node.style.dynamic.base))
  ) {
    node.style.static.base.backgroundColor = 'transparent'
  }

  if (hasKeys(node.style.static.base)) {
    const id = createId(node, state)
    if (
      node.nameFinal === 'FlatList' &&
      hasPaddingProp(node.style.static.base)
    ) {
      debugger

      state.styles[`${id}ContentContainer`] = getPaddingProps(
        node.style.static.base
      )
      node.style.static.base = removePaddingProps(node.style.static.base)
      containerStyle = `styles.${id}ContentContainer`
    }
    state.styles[id] = node.style.static.base
    style = `styles.${id}`
  }

  if (node.isAnimated) {
    const animated = getAnimatedStyles(node, state.isReactNative)
    style = style ? `[${style},{${animated}}]` : `{${animated}}`
    state.isAnimated = true
    state.animations = node.animations
    state.scopes = node.scopes
  }

  if (hasKeys(dynamicStyles)) {
    const dynamic = getObjectAsString(dynamicStyles)
    style = style ? `[${style},${dynamic}]` : dynamic
  }

  if (hasAnimatedChild(node)) {
    state.hasAnimatedChild = true
  }

  if (style) {
    state.render.push(` style={${style}}`)
  }

  if (containerStyle) {
    state.render.push(` contentContainerStyle={${containerStyle}}`)
  }
}
