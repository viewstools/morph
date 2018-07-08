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
  const allowedStyleKeys = getAllowedStyleKeys(node)

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

  const css = [
    getStaticCss({ node, scopedUnderParent, state, allowedStyleKeys }),
    node.isAnimated && getAnimatedCss(node),
    getDynamicCss({ node, scopedUnderParent, state, allowedStyleKeys }),
  ].filter(Boolean)

  if (css.length > 0) {
    const id = createId(node, state)
    state.styles[id] = `const ${id} = css({label: '${id}', ${css.join(', ')}})`
  }
}

const getStaticCss = ({ node, scopedUnderParent, state, allowedStyleKeys }) => {
  const style = node.style.static
  if (!hasKeysInChildren(style)) return false

  state.cssStatic = true

  const hasDynamicCss = hasKeysInChildren(node.style.dynamic)

  return Object.keys(style)
    .filter(key => allowedStyleKeys.includes(key) && hasKeys(style[key]))
    .map(key =>
      asCss(
        asStaticCss(
          style[key],
          hasDynamicCss ? Object.keys(node.style.dynamic[key]) : []
        ),
        key,
        scopedUnderParent
      ).join('\n')
    )
    .join(',\n')
}

const getDynamicCss = ({
  node,
  scopedUnderParent,
  state,
  allowedStyleKeys,
}) => {
  const style = node.style.dynamic
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
    const inlineDynamicStyles = getDynamicStyles(node)
    if (inlineDynamicStyles) {
      state.render.push(` style={{${inlineDynamicStyles}}}`)
    }
  }

  return Object.keys(style)
    .filter(key => allowedStyleKeys.includes(key) && hasKeys(style[key]))
    .map(key =>
      asCss(asDynamicCss(style[key]), key, scopedUnderParent).join('\n')
    )
    .join(',\n')
}

const getAnimatedCss = node => {
  if (node.hasTimingAnimation) {
    const transition = uniq(getTimingProps(node).map(makeTransition)).join(', ')

    return `\ntransition: '${transition}',\nwillChange: '${getUniqueNames(
      node
    )}'`
  }

  return `\nwillChange: '${getUniqueNames(node)}'`
}

const getUniqueNames = node => {
  const names = [
    ...new Set(getAllAnimatedProps(node, false).map(prop => prop.name)),
  ]
  return uniq(names.map(name => ensurePropName(name))).join(', ')
}

const ensurePropName = name => {
  switch (name) {
    case 'rotate':
    case 'rotateX':
    case 'rotateY':
    case 'scale':
    case 'translateX':
    case 'translateY':
      return 'transform'

    default:
      return toSlugCase(name)
  }
}

const makeTransition = ({ name, animation }) =>
  `${ensurePropName(name)} ${animation.duration}ms ${toSlugCase(
    animation.curve
  )} ${animation.delay}ms`

const asDynamicCss = styles =>
  Object.keys(styles).map(prop => `${prop}: ${styles[prop]}`)

const safe = str =>
  typeof str === 'string' ? `"${str.replace(/"/g, "'")}"` : str

const asStaticCss = (styles, dynamicStyles = []) =>
  Object.keys(styles)
    .filter(prop => !dynamicStyles.includes(prop))
    .map(prop => `${prop}: ${safe(styles[prop])}`)

const asCss = (styles, key, scopedUnderParent) => {
  let css = []

  if (key !== 'base') {
    if (scopedUnderParent) {
      const parent = `.\${${scopedUnderParent}}`
      css.push(`[\`${parent}:${key} &, ${parent}.${key} &\`]: {`)
    } else if (key === 'disabled' || key === 'hover' || key === 'focus') {
      css.push(`"&:${key}": {`)
    } else if (key === 'print') {
      // TODO can we use this to support all media queries?
      css.push('"@media print": {')
    } else if (key === 'placeholder') {
      css.push(`"&::placeholder": {`)
    }
  }

  css.push(styles.join(',\n'))

  if (key !== 'base') css.push(`}`)

  return css
}
