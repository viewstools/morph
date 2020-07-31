import { enter } from '../react/properties-style.js'
import {
  createId,
  getAnimatedStyles,
  getObjectAsString,
  // TODO: Think of a better name 🙈
  getNonAnimatedDynamicStyles,
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
    state.render.push(` style={`)

    let key = [
      baseStyle && 'base',
      animatedStyle && 'animated',
      dynamicStyle && 'dynamic',
    ]
      .filter(Boolean)
      .join('-')

    switch (key) {
      case 'base': {
        state.render.push(baseStyle)
        break
      }

      case 'animated': {
        state.render.push(`{${animatedStyle}}`)
        break
      }

      case 'dynamic': {
        state.render.push(`{${dynamicStyle}}`)
        break
      }

      case 'base-animated': {
        if (state.morpher === 'react-pdf') {
          state.render.push(`{...${baseStyle}, ${animatedStyle}}`)
        } else {
          state.render.push(`[${baseStyle},{${animatedStyle}}]`)
        }
        break
      }

      case 'base-animated-dynamic': {
        if (state.morpher === 'react-pdf') {
          state.render.push(
            `{...${baseStyle},${animatedStyle}, ${dynamicStyle}}`
          )
        } else {
          state.render.push(
            `[${baseStyle},{${animatedStyle}},{${dynamicStyle}}]`
          )
        }
        break
      }

      case 'base-dynamic': {
        if (state.morpher === 'react-pdf') {
          state.render.push(`{...${baseStyle}, ${dynamicStyle}}`)
        } else {
          state.render.push(`[${baseStyle},{${dynamicStyle}}]`)
        }
        break
      }

      case 'animated-dynamic': {
        if (state.morpher === 'react-pdf') {
          state.render.push(`{${animatedStyle}, ${dynamicStyle}}`)
        } else {
          state.render.push(`[{${animatedStyle}},{${dynamicStyle}}]`)
        }
        break
      }

      default: {
        throw new Error(`Invalid style key ${key}`)
      }
    }

    state.render.push(`}`)
  }

  if (containerStyle) {
    state.render.push(` contentContainerStyle={${containerStyle}}`)
  }
}
