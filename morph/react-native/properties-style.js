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
  let baseStyle = null
  let animatedStyle = null
  let dynamicStyle = null
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
      baseStyle = `styles.${id}`
    }
  }

  if (node.isAnimated) {
    animatedStyle = getAnimatedStyles(node, state.isReactNative)

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
      dynamicStyle = getObjectAsString(dynamicStyles)
      dynamicStyle = dynamicStyle.substr(1, dynamicStyle.length - 2)
    }
  }

  if (baseStyle || animatedStyle || dynamicStyle) {
    let style = baseStyle
    if (animatedStyle) {
      // TODO once https://github.com/drcmda/react-spring/issues/337 gets
      // fixed, come back to using the array notation
      style = `{...${baseStyle},${animatedStyle},${dynamicStyle || ''}}`
    } else if (dynamicStyle) {
      style = `[${baseStyle},{${dynamicStyle}}]`
    }

    state.render.push(` style={${style}}`)
  }

  if (containerStyle) {
    state.render.push(` contentContainerStyle={${containerStyle}}`)
  }
}
