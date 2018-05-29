import { enter } from '../react/properties-style.js'
import {
  createId,
  getAnimatedStyles,
  getObjectAsString,
  hasAnimatedChild,
  // TODO: Think of a better name 🙈
  getNonAnimatedDynamicStyles,
  hasKeys,
} from '../utils.js'

export { enter }

export const leave = (node, parent, state) => {
  const dynamicStyles = getNonAnimatedDynamicStyles(node)
  let style = null

  if (
    node.ensureBackgroundColor &&
    (!('backgroundColor' in node.style.static.base) ||
      !('backgroundColor' in node.style.dynamic.base))
  ) {
    node.style.static.base.backgroundColor = 'transparent'
  }

  if (hasKeys(node.style.static.base)) {
    const id = createId(node, state)
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
}
