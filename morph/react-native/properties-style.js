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

export let leave = (node, parent, state) => {
  if (node.isFragment) return

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
    let id = createId(node, state)

    state.styles[id] = node.style.static.base
    baseStyle = `styles.${id}`
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
    dynamicStyle = getObjectAsString(dynamicStyles)
    dynamicStyle = dynamicStyle.substr(1, dynamicStyle.length - 2)
  }

  if (baseStyle || animatedStyle || dynamicStyle) {
    let style = baseStyle
    if (animatedStyle) {
      // TODO once https://github.com/drcmda/react-spring/issues/337 gets
      // fixed, come back to using the array notation
      style = `{...${baseStyle},${animatedStyle},${dynamicStyle || ''}}`
    } else if (dynamicStyle) {
      if (state.morpher === 'react-pdf') {
        style = `{...${baseStyle}, ${dynamicStyle}}`
      } else {
        style = `[${baseStyle},{${dynamicStyle}}]`
      }
    }

    state.render.push(` style={${style}}`)
  }

  if (containerStyle) {
    state.render.push(` contentContainerStyle={${containerStyle}}`)
  }
}
