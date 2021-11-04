import chalk from 'chalk'
import { enter } from '../react/properties-style.js'
import {
  createId,
  getAnimatedStyles,
  getObjectAsString,
  // TODO: Think of a better name 🙈
  getNonAnimatedDynamicStyles,
  hasKeys,
} from '../utils.js'

let TEXT_PROPS = [
  'display',
  'width',
  'height',
  'start',
  'end',
  'top',
  'left',
  'right',
  'bottom',
  'minWidth',
  'maxWidth',
  'minHeight',
  'maxHeight',
  'margin',
  'marginVertical',
  'marginHorizontal',
  'marginTop',
  'marginBottom',
  'marginLeft',
  'marginRight',
  'marginStart',
  'marginEnd',
  'padding',
  'paddingVertical',
  'paddingHorizontal',
  'paddingTop',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
  'paddingStart',
  'paddingEnd',
  'borderWidth',
  'borderTopWidth',
  'borderStartWidth',
  'borderEndWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'position',
  'flexDirection',
  'flexWrap',
  'justifyContent',
  'alignItems',
  'alignSelf',
  'alignContent',
  'overflow',
  'flex',
  'flexGrow',
  'flexShrink',
  'flexBasis',
  'aspectRatio',
  'zIndex',
  'direction',
  'shadowColor',
  'shadowOffset',
  'shadowOpacity',
  'shadowRadius',
  'transform',
  'transformMatrix',
  'decomposedMatrix',
  'scaleX',
  'scaleY',
  'rotation',
  'translateX',
  'translateY',
  'backfaceVisibility',
  'backgroundColor',
  'borderColor',
  'borderTopColor',
  'borderRightColor',
  'borderBottomColor',
  'borderLeftColor',
  'borderStartColor',
  'borderEndColor',
  'borderRadius',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderTopStartRadius',
  'borderTopEndRadius',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
  'borderBottomStartRadius',
  'borderBottomEndRadius',
  'borderStyle',
  'opacity',
  'elevation',
  'color',
  'fontFamily',
  'fontSize',
  'fontStyle',
  'fontWeight',
  'fontVariant',
  'textShadowOffset',
  'textShadowRadius',
  'textShadowColor',
  'letterSpacing',
  'lineHeight',
  'textAlign',
  'textAlignVertical',
  'includeFontPadding',
  'textDecorationLine',
  'textDecorationStyle',
  'textDecorationColor',
  'textTransform',
  'writingDirection',
]

let VIEW_PROPS = [
  'alignContent',
  'alignItems',
  'alignSelf',
  'aspectRatio',
  'backfaceVisibility',
  'backgroundColor',
  'borderBottomColor',
  'borderBottomEndRadius',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
  'borderBottomStartRadius',
  'borderBottomWidth',
  'borderColor',
  'borderEndColor',
  'borderEndWidth',
  'borderLeftColor',
  'borderLeftWidth',
  'borderRadius',
  'borderRightColor',
  'borderRightWidth',
  'borderStartColor',
  'borderStartWidth',
  'borderStyle',
  'borderTopColor',
  'borderTopEndRadius',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderTopStartRadius',
  'borderTopWidth',
  'borderWidth',
  'bottom',
  'color',
  'decomposedMatrix',
  'direction',
  'display',
  'elevation',
  'end',
  'flex',
  'flexBasis',
  'flexDirection',
  'flexGrow',
  'flexShrink',
  'flexWrap',
  'fontFamily',
  'fontSize',
  'fontStyle',
  'fontVariant',
  'fontWeight',
  'height',
  'includeFontPadding',
  'justifyContent',
  'left',
  'letterSpacing',
  'lineHeight',
  'margin',
  'marginBottom',
  'marginEnd',
  'marginHorizontal',
  'marginLeft',
  'marginRight',
  'marginStart',
  'marginTop',
  'marginVertical',
  'maxHeight',
  'maxWidth',
  'minHeight',
  'minWidth',
  'opacity',
  'overflow',
  'overlayColor',
  'padding',
  'paddingBottom',
  'paddingEnd',
  'paddingHorizontal',
  'paddingLeft',
  'paddingRight',
  'paddingStart',
  'paddingTop',
  'paddingVertical',
  'position',
  'resizeMode',
  'right',
  'rotation',
  'scaleX',
  'scaleY',
  'shadowColor',
  'shadowOffset',
  'shadowOpacity',
  'shadowRadius',
  'start',
  'textAlign',
  'textAlignVertical',
  'textDecorationColor',
  'textDecorationLine',
  'textDecorationStyle',
  'textShadowColor',
  'textShadowOffset',
  'textShadowRadius',
  'textTransform',
  'tintColor',
  'top',
  'transform',
  'transformMatrix',
  'translateX',
  'translateY',
  'width',
  'writingDirection',
  'zIndex',
]

let BLOCK_TYPES = ['Text', 'Horizontal', 'Vertical']

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

    if (BLOCK_TYPES.includes(node.name)) {
      state.styles[id] = filterInvalidStyles(
        node.style.static.base,
        node.name === 'Text' ? TEXT_PROPS : VIEW_PROPS,
        node,
        state
      )
    } else {
      state.styles[id] = node.style.static.base
    }

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
    if (BLOCK_TYPES.includes(node.name)) {
      dynamicStyles = filterInvalidStyles(
        dynamicStyles,
        node.name === 'Text' ? TEXT_PROPS : VIEW_PROPS,
        node,
        state
      )
    }
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

function filterInvalidStyles(styles, validStyles, node, state) {
  let result = {}
  for (let key of Object.keys(styles)) {
    if (validStyles.includes(key)) {
      result[key] = styles[key]
    } else {
      printWarning(
        `Ignoring unrecognized style property "${key}: ${styles[key]}"`,
        node.is || node.name,
        state.viewPath
      )
    }
  }
  return result
}

function printWarning(warning, nodeName, viewPath) {
  console.error(chalk.red(nodeName), chalk.dim(viewPath))
  console.error(`  ${chalk.blue(warning)}`)
}
