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
  hasRowStyles,
  isTable,
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

  let id = null

  if (isTable(node) && hasRowStyles(node)) {
    id = createId(node, state, false)
    getTableRowCss({ node, state, id, scopedUnderParent })
  }

  let css = [
    getStaticCss({ node, scopedUnderParent, state, allowedStyleKeys }),
    node.isAnimated && getAnimatedCss(node),
    getDynamicCss({ node, scopedUnderParent, state, allowedStyleKeys }),
  ].filter(Boolean)

  if (css.length > 0) {
    if (id === null) {
      id = createId(node, state)
    } else if (isTable(node)) {
      if (node.className) {
        node.className.push(`\${styles.${id}}`)
      }
    }

    state.styles[id] = `css({label: '${id}', ${css.join(', ')}})`
    state.stylesOrder.push(id)
  }
}

let composeStyles = (node, styles, scopedUnderParent) => {
  let allowedStyleKeys = getAllowedStyleKeys(node)

  if (hasKeysInChildren(styles.dynamic)) {
    let cssStatic = Object.keys(styles.static)
      .filter(
        key => allowedStyleKeys.includes(key) && hasKeys(styles.static[key])
      )
      .map(key =>
        asCss(
          asStaticCss(styles.static[key], Object.keys(styles.dynamic[key])),
          key,
          scopedUnderParent
        ).join('\n')
      )

    cssStatic = cssStatic.join(',\n')

    let cssDynamic = Object.keys(styles.dynamic)
      .filter(
        key => allowedStyleKeys.includes(key) && hasKeys(styles.dynamic[key])
      )
      .map(key =>
        asCss(asDynamicCss(styles.dynamic[key]), key, scopedUnderParent).join(
          '\n'
        )
      )
      .join(',\n')

    return { cssDynamic, cssStatic }
  }

  let cssStatic = Object.keys(styles.static)
    .filter(
      key => allowedStyleKeys.includes(key) && hasKeys(styles.static[key])
    )
    .map(key =>
      asCss(asStaticCss(styles.static[key]), key, scopedUnderParent).join('\n')
    )
    .join(',\n')

  return { cssStatic }
}

let getStaticCss = ({ node, scopedUnderParent, state, allowedStyleKeys }) => {
  let style = node.style.static
  if (!hasKeysInChildren(style)) return false

  state.cssStatic = true

  let hasDynamicCss = hasKeysInChildren(node.style.dynamic)

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

let getDynamicCss = ({ node, scopedUnderParent, state, allowedStyleKeys }) => {
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
    .filter(key => allowedStyleKeys.includes(key) && hasKeys(style[key]))
    .map(key =>
      asCss(asDynamicCss(style[key]), key, scopedUnderParent).join('\n')
    )
    .join(',\n')
}

let getAnimatedCss = node => {
  if (node.hasTimingAnimation) {
    let transition = uniq(getTimingProps(node).map(makeTransition)).join(', ')

    return `\ntransition: '${transition}',\nwillChange: '${getUniqueNames(
      node
    )}'`
  }

  return `\nwillChange: '${getUniqueNames(node)}'`
}

let getUniqueNames = node => {
  let names = [
    ...new Set(getAllAnimatedProps(node, false).map(prop => prop.name)),
  ]
  return uniq(names.map(name => ensurePropName(name))).join(', ')
}

let ensurePropName = name => {
  switch (name) {
    case 'rotate':
    case 'rotateX':
    case 'rotateY':
    case 'scale':
    case 'translateX':
    case 'translateY':
      return 'transform'

    case 'shadowColor':
    case 'shadowBlur':
    case 'shadowOffsetX':
    case 'shadowOffsetY':
    case 'shadowSpread':
      return 'box-shadow'

    default:
      return toSlugCase(name)
  }
}

let makeTransition = ({ name, animation }) =>
  [
    ensurePropName(name),
    `${animation.duration}ms`,
    toSlugCase(animation.curve),
    animation.delay && `${animation.delay}ms`,
  ]
    .filter(Boolean)
    .join(' ')

let asDynamicCss = styles =>
  Object.keys(styles).map(prop => `${prop}: ${styles[prop]}`)

let safe = str =>
  typeof str === 'string' ? `"${str.replace(/"/g, "'")}"` : str

let asStaticCss = (styles, dynamicStyles = []) =>
  Object.keys(styles)
    .filter(prop => !dynamicStyles.includes(prop))
    .map(prop => `${prop}: ${safe(styles[prop])}`)

let systemScopeToCssKey = {
  isDisabled: 'disabled',
  isHovered: 'hover',
  isFocused: 'focus',
}
let ensureSystemScopeCssKey = key => systemScopeToCssKey[key] || key

let asCss = (styles, key, scopedUnderParent) => {
  let css = []

  if (key !== 'base') {
    if (scopedUnderParent) {
      let parent = `.\${styles.${scopedUnderParent}}`
      let theKey = ensureSystemScopeCssKey(key)
      css.push(`[\`${parent}:${theKey} &\`]: {`)
    } else if (
      key === 'isDisabled' ||
      key === 'isHovered' ||
      key === 'isFocused' ||
      key === 'isSelected'
    ) {
      css.push(`"&:${ensureSystemScopeCssKey(key)}": {`)
    } else if (key === 'isPlaceholder') {
      css.push(`"&::placeholder": {`)
    }
  }

  css.push(styles.join(',\n'))

  if (key !== 'base') css.push(`}`)

  return css
}

let getTableRowCss = ({ node, state, id, scopedUnderParent }) => {
  let normalStyles = {}
  let alternateStyles = {}

  Object.entries(node.style).forEach(([type, typeScopes]) => {
    if (!(type in alternateStyles)) {
      alternateStyles[type] = {}
    }
    if (!(type in normalStyles)) {
      normalStyles[type] = {}
    }

    Object.entries(typeScopes).forEach(([scope, scopeStyles]) => {
      if (!(scope in alternateStyles[type])) {
        alternateStyles[type][scope] = {}
      }
      if (!(scope in normalStyles[type])) {
        normalStyles[type][scope] = {}
      }

      Object.entries(scopeStyles).forEach(([key, value]) => {
        switch (key) {
          case 'rowColor':
            normalStyles[type][scope]['color'] = value
            delete node.style[type][scope][key]
            break
          case 'rowBackgroundColor':
            normalStyles[type][scope]['backgroundColor'] = value
            delete node.style[type][scope][key]
            break
          case 'rowColorAlternate':
            alternateStyles[type][scope]['color'] = value
            delete node.style[type][scope][key]
            break
          case 'rowBackgroundColorAlternate':
            alternateStyles[type][scope]['backgroundColor'] = value
            delete node.style[type][scope][key]
            break

          default:
            break
        }
      })
    })
  })

  let { cssDynamic: normalDynamic, cssStatic: normalStatic } = composeStyles(
    node,
    normalStyles,
    scopedUnderParent
  )

  let {
    cssDynamic: alternateDynamic,
    cssStatic: alternateStatic,
  } = composeStyles(node, alternateStyles, scopedUnderParent)

  let normalCss = `${normalStatic ? `${normalStatic}` : ''} ${
    normalDynamic ? `, ${normalDynamic}` : ''
  }`

  let alternateCss = `${alternateStatic ? `${alternateStatic}` : ''} ${
    alternateDynamic ? `, ${alternateDynamic}` : ''
  }`

  node.hasDynamicRowStyles = !!(normalDynamic || alternateDynamic)
  state.render.push(` rowClassName={styles.${id}Row}`)

  state.styles[`${id}Row`] = `css({ display: 'flex'
    ${normalCss ? `, ${normalCss}` : ''}
    ${alternateCss ? `, "&:nth-child(even)": {${alternateCss}}` : ''}
    })`
  state.stylesOrder.push(`${id}Row`)
}
