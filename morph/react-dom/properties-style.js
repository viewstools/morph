import { enter } from '../react/properties-style.js'
import {
  createId,
  getActionableParent,
  getAllAnimatedProps,
  getAllowedStyleKeys,
  getAnimatedStyles,
  getDynamicStyles,
  getTimingProps,
  hasKeys,
  hasKeysInChildren,
} from '../utils.js'
import toSlugCase from 'to-slug-case'
import uniq from 'array-uniq'

export { enter }

export function leave(node, parent, state) {
  if (node.isFragment) return

  let allowedStyleKeys = getAllowedStyleKeys(node)

  let scopedUnderParent =
    !node.isCapture && !node.action && getActionableParent(node)

  if (scopedUnderParent) {
    scopedUnderParent = scopedUnderParent.styleName
  }

  if (node.hasSpringAnimation) {
    state.isAnimated = true
    state.hasSpringAnimation = true
    state.animations[node.id] = node.animations
    state.scopes = node.scopes
  }

  let css = {}
  getStaticCss({ node, scopedUnderParent, state, allowedStyleKeys, css })
  getAnimatedCss(node, css)
  getDynamicCss({ node, scopedUnderParent, state, allowedStyleKeys, css })

  if (Object.keys(css).length > 0) {
    let id = createId(node, state)
    Object.entries(css).forEach(([key, content]) => {
      let lid = key.replace('VIEW_ID', id)
      state.styles[lid] = content.join('\n')
      state.stylesOrder.push(lid)
    })
  }
}

function getStaticCss({
  node,
  scopedUnderParent,
  state,
  allowedStyleKeys,
  css,
}) {
  let style = node.style.static
  if (!hasKeysInChildren(style)) return false

  state.cssStatic = true

  Object.keys(style)
    .filter((key) => allowedStyleKeys.includes(key) && hasKeys(style[key]))
    .forEach((key) => {
      let dynamic = node.style.dynamic[key]

      let code = asCss(
        Object.entries(style[key]).filter(([key]) => !(key in dynamic))
      )
      addCodeToCss(code, key, scopedUnderParent, css)
    })
}

function getDynamicCss({
  node,
  scopedUnderParent,
  state,
  allowedStyleKeys,
  css,
}) {
  let style = node.style.dynamic
  if (!hasKeysInChildren(style)) return false

  state.cssDynamic = true
  node.styleName = node.nameFinal

  if (node.hasSpringAnimation) {
    state.render.push(
      ` style={{${getAnimatedStyles(
        node,
        state.isReactNative
      )},${getDynamicStyles(node)}}}`
    )
  } else {
    let inlineDynamicStyles = getDynamicStyles(node)
    if (inlineDynamicStyles) {
      state.render.push(` style={{${inlineDynamicStyles}}}`)
    }
  }

  return Object.keys(style)
    .filter((key) => allowedStyleKeys.includes(key) && hasKeys(style[key]))
    .forEach((key) => {
      addCodeToCss(
        asCss(Object.entries(style[key])),
        key,
        scopedUnderParent,
        css
      )
    })
}

function getAnimatedCss(node, css) {
  if (!node.isAnimated) return

  if (!('VIEW_ID' in css)) {
    css['VIEW_ID'] = []
  }

  css['VIEW_ID'].push(`  will-change: ${getUniqueNames(node)};`)
  if (node.hasTimingAnimation) {
    let transition = uniq(getTimingProps(node).map(makeTransition)).join(', ')

    css['VIEW_ID'].push(`  transition: ${transition};`)
  }
}

function getUniqueNames(node) {
  let names = [
    ...new Set(getAllAnimatedProps(node, false).map((prop) => prop.name)),
  ]
  return uniq(names.map((name) => ensurePropName(name))).join(', ')
}

function ensurePropName(name) {
  switch (name) {
    case 'rotate':
    case 'rotateX':
    case 'rotateY':
    case 'scale':
    case 'scaleX':
    case 'scaleY':
    case 'translateX':
    case 'translateY':
      return 'transform'

    case 'shadowColor':
    case 'shadowBlur':
    case 'shadowOffsetX':
    case 'shadowOffsetY':
    case 'shadowSpread':
    case 'shadowInset':
      return 'box-shadow'

    default:
      return toSlugCase(name)
  }
}

function makeTransition({ name, animation }) {
  return [
    ensurePropName(name),
    `${animation.duration}ms`,
    toSlugCase(animation.curve),
    animation.delay && `${animation.delay}ms`,
  ]
    .filter(Boolean)
    .join(' ')
}

function asCss(styles) {
  return styles.map(([key, value]) => `  ${toSlugCase(key)}: ${value};`)
}

let systemScopeToCssKey = {
  isDisabled: 'disabled',
  // isHovered: 'hover:enabled',
  isFocused: 'focus:enabled',
}
function ensureSystemScopeCssKey(key) {
  return systemScopeToCssKey[key] || key
}

function addCodeToCss(code, key, scopedUnderParent, css) {
  let cssKey = 'VIEW_ID'

  if (key !== 'base' && scopedUnderParent) {
    cssKey = `${scopedUnderParent}:${ensureSystemScopeCssKey(key)} .VIEW_ID`
  } else if (
    key === 'isDisabled' ||
    // key === 'isHovered' ||
    key === 'isFocused'
  ) {
    cssKey = `VIEW_ID:${ensureSystemScopeCssKey(key)}`
  } else if (key === 'isPlaceholder') {
    cssKey = `VIEW_ID::placeholder`
  }

  if (!(cssKey in css)) {
    css[cssKey] = []
  }

  css[cssKey] = [...css[cssKey], ...code]
}
