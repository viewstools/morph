import { enter } from '../react/properties-style.js'
import {
  createId,
  getAnimatedStyles,
  getObjectAsString,
  // TODO: Think of a better name 🙈
  getNonAnimatedDynamicStyles,
  hasContentContainerStyleProp,
  getContentContainerStyleProps,
  removeContentContainerStyleProps,
  hasKeys,
} from '../utils.js'

export { enter }

export const leave = (node, parent, state) => {
  let dynamicStyles = getNonAnimatedDynamicStyles(node)
  let style = null
  let containerStyle = null

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
      node.nameFinal.includes('FlatList') &&
      hasContentContainerStyleProp(node.style.static.base)
    ) {
      state.styles[`${id}ContentContainer`] = getContentContainerStyleProps(
        node.style.static.base
      )
      node.style.static.base = removeContentContainerStyleProps(
        node.style.static.base
      )
      containerStyle = `styles.${id}ContentContainer`
    }
    if (hasKeys(node.style.static.base)) {
      state.styles[id] = node.style.static.base
      style = `styles.${id}`
    }
  }

  if (node.isAnimated) {
    const animated = getAnimatedStyles(node, state.isReactNative)
    style = style ? `[${style},{${animated}}]` : `{${animated}}`
    state.isAnimated = true
    state.animations[node.id] = node.animations
    if (node.hasSpringAnimation) {
      state.hasSpringAnimation = true
    }

    if (node.hasTimingAnimation) {
      state.hasTimingAnimation = true
    }
    state.scopes = node.scopes
  }

  if (hasKeys(dynamicStyles)) {
    if (
      node.nameFinal.includes('FlatList') &&
      hasContentContainerStyleProp(dynamicStyles)
    ) {
      const dynamicContainerStyle = getObjectAsString(
        getContentContainerStyleProps(dynamicStyles)
      )
      dynamicStyles = removeContentContainerStyleProps(dynamicStyles)
      containerStyle = containerStyle
        ? `[${containerStyle},${dynamicContainerStyle}]`
        : dynamicContainerStyle
    }
    if (hasKeys(dynamicStyles)) {
      const dynamic = getObjectAsString(dynamicStyles)
      style = style ? `[${style},${dynamic}]` : dynamic
    }
  }

  if (style) {
    state.render.push(` style={${style}}`)
  }

  if (containerStyle) {
    state.render.push(` contentContainerStyle={${containerStyle}}`)
  }
}
