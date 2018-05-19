import { enter } from '../react/properties-style.js'
import {
  checkForTransforms,
  combineTransforms,
  getActionableParent,
  getAllAnimatedProps,
  getAllowedStyleKeys,
  getAnimatedStyles,
  getSpringProps,
  getTimingProps,
  hasAnimatedChild,
  hasKeys,
  hasKeysInChildren,
  hasSpringAnimation,
  hasTimingAnimation,
} from '../utils.js'
import hash from '../hash.js'
import toSlugCase from 'to-slug-case'
import uniq from 'array-uniq'

export { enter }

export function leave(node, parent, state) {
  const { dynamic, static: staticStyle } = node.style

  const allowedStyleKeys = getAllowedStyleKeys(node)
  let scopedUnderParent =
    !node.isCapture && !node.action && getActionableParent(node)
  if (scopedUnderParent) {
    scopedUnderParent = scopedUnderParent.styleName
  }

  if (hasAnimatedChild(node) && hasSpringAnimation(node)) {
    state.hasAnimatedChild = true
  }

  if (node.isAnimated && hasSpringAnimation(node)) {
    state.render.push(
      ` style={{${getAnimatedStyles(node, state.isReactNative)}}}`
    )
    state.isAnimated = true
    state.animations = node.animations
    state.scopes = node.scopes
  }

  // dynamic merges static styles
  if (hasKeysInChildren(dynamic)) {
    state.cssDynamic = true
    node.styleName = node.nameFinal

    let cssStatic = Object.keys(staticStyle)
      .filter(
        key => allowedStyleKeys.includes(key) && hasKeys(staticStyle[key])
      )
      .map(key =>
        asCss(
          asStaticCss(staticStyle[key], Object.keys(dynamic[key])),
          key,
          scopedUnderParent
        ).join('\n')
      )

    if (hasSpringAnimation(node)) {
      cssStatic = [
        ...cssStatic,
        ...asVarsCss(getSpringProps(node), node.nameFinal),
      ]
    }

    cssStatic = cssStatic.join(',\n')

    if (node.isAnimated) {
      cssStatic = cssStatic
        ? `${cssStatic}, ${asAnimatedCss(node)}`
        : asAnimatedCss(node)

      filterBaseStyles(node, dynamic)
      // if there's no dynamic keys left after filtering out springs
      // then we can use css instead of a styled component
      if (!hasKeysInChildren(dynamic)) {
        const id = createId(node, staticStyle)
        return (state.styles[id] = `const ${id} = css({${cssStatic}})`)
      }
    }

    let cssDynamic = ['({ props }) => ({']
    cssDynamic = cssDynamic.concat(
      Object.keys(dynamic)
        .filter(key => allowedStyleKeys.includes(key) && hasKeys(dynamic[key]))
        .map(key =>
          asCss(asDynamicCss(dynamic[key]), key, scopedUnderParent).join('\n')
        )
        .join(',\n')
    )

    cssDynamic.push('})')
    cssDynamic = cssDynamic.join('\n')

    const nameTag =
      node.isAnimated && hasSpringAnimation(node)
        ? `Animated.div`
        : `'${node.nameTag}'`

    if (cssStatic || cssDynamic) {
      state.styles[node.nameFinal] = `const ${
        node.nameFinal
      } = styled(${nameTag})(${
        cssStatic ? `{${cssStatic}}, ` : ''
      }${cssDynamic})`

      // TODO we may want to be smarter here and only pass what's needed
      state.render.push(` props={props}`)
    }
  } else if (hasKeysInChildren(staticStyle)) {
    state.cssStatic = true

    const id = createId(node, staticStyle)
    const css = Object.keys(staticStyle)
      .filter(
        key => allowedStyleKeys.includes(key) && hasKeys(staticStyle[key])
      )
      .map(key =>
        asCss(asStaticCss(staticStyle[key]), key, scopedUnderParent).join('\n')
      )
      .join(',\n')

    if (css) {
      state.styles[id] = `const ${id} = css({${css}})`
    }
  }
}

const asAnimatedCss = node => {
  if (hasTimingAnimation(node)) {
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
      let parent = `\${${scopedUnderParent}}`
      if (/_/.test(scopedUnderParent)) {
        parent = `.${parent}`
      }
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

const filterBaseStyles = (node, dynamic) => {
  const springs = getSpringProps(node).map(spring => spring.name)

  dynamic.base = Object.keys(dynamic.base)
    .filter(prop => !springs.includes(prop))
    .reduce((obj, key) => {
      obj[key] = dynamic.base[key]
      return obj
    }, {})

  return dynamic
}

const asVarsCss = (springs, component) => {
  let varsCss = ''
  if (checkForTransforms(springs)) {
    springs = combineTransforms(springs)
  }

  return springs.map(spring => {
    if (spring.name === 'transform') {
      return `${spring.name}: ${spring.props
        .map(prop => `"var(--${component}-${prop.name})"`)
        .join(', ')}`
    }
    return `${spring.name}: "var(--${component}-${spring.name})"`
  })
}

const createId = (node, staticStyle) => {
  const id = `${node.is || node.name}_${hash(staticStyle)}`
  node.styleName = id
  node.className.push(`\${${id}}`)
  return id
}
