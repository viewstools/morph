import flatten from 'flatten'
import safe from './react/safe.js'
import toCamelCase from 'to-camel-case'
import toSlugCase from 'to-slug-case'
import wrap from './react/wrap.js'

const safeScope = value =>
  typeof value === 'string' && !isSlot(value) ? JSON.stringify(value) : value

export const checkParentStem = (node, styleKey) => {
  if (styleKey !== 'hover' || styleKey !== 'disabled' || !node.parent)
    return false

  const matchingParentStem = node.parent.scopes.some(
    scope => scope.value === styleKey
  )

  return matchingParentStem && (node.parent.is || node.parent.name)
}

const INTERPOLATION = /\${(.+)}/
export const isInterpolation = str => INTERPOLATION.test(str)
export const deinterpolate = str => {
  const match = str.match(INTERPOLATION)
  return match ? match[1] : str
}

export const getObjectAsString = obj =>
  wrap(
    Object.keys(obj)
      .map(k => {
        const v =
          typeof obj[k] === 'object' && hasKeys(obj[k])
            ? getObjectAsString(obj[k])
            : obj[k]
        return `${JSON.stringify(k)}: ${v}`
      })
      .join(',')
  )

export const getPropertiesAsObject = list => {
  const obj = {}

  list.forEach(prop => {
    obj[prop.name] = safeScope(prop.value)
  })

  return getObjectAsString(obj)
}

export const getProp = (node, key) => {
  const finder =
    typeof key === 'string' ? p => p.name === key : p => key.test(p.name)

  return node.properties && node.properties.find(finder)
}

export const getScope = node => node.value.split('when ')[1]

const maybeSafe = node =>
  node.tags.slot
    ? node.value
    : typeof node.value === 'string' ? safe(node.value) : node.value

const getScopedProps = (propNode, blockNode) => {
  const scopes = blockNode.scopes
    .filter(scope => !scope.isSystem && !scope.isLocal)
    .map(scope => {
      const prop = scope.properties.find(prop => prop.name === propNode.name)
      return prop && { prop, when: scope.value }
    })
    .filter(Boolean)
    .reverse()

  if (isEmpty(scopes)) return false

  return scopes
}

export const getScopedCondition = (propNode, blockNode) => {
  let conditional = maybeSafe(propNode)

  if (!getScopedProps(propNode, blockNode)) return false

  getScopedProps(propNode, blockNode).forEach(scope => {
    conditional = `${scope.when} ? ${maybeSafe(scope.prop)} : ` + conditional
  })

  return conditional
}

export const getScopedImageCondition = (scopes, scopedNames, defaultName) => {
  let conditional = defaultName

  scopes.forEach((scope, index) => {
    conditional = `${scope.when} ? ${scopedNames[index]} : ` + conditional
  })

  return conditional
}

const styleStems = ['hover', 'focus', 'placeholder', 'disabled', 'print']
export const getStyleType = node =>
  styleStems.find(tag => isTag(node, tag)) || 'base'
export const hasKeys = obj => Object.keys(obj).length > 0
export const hasKeysInChildren = obj =>
  Object.keys(obj).some(k => hasKeys(obj[k]))

export const hasProp = (node, key, match) => {
  const prop = getProp(node, key)
  if (!prop) return false
  return typeof match === 'function' ? match(prop.value) : true
}

export const hasDefaultProp = (node, parent) =>
  parent.properties.some(prop => prop.nameRaw === node.nameRaw)

export const isSlot = node =>
  typeof node === 'string' ? /props/.test(node) : isTag(node, 'slot')
export const isStyle = node => isTag(node, 'style')
export const isTag = (node, tag) => node && node.tags[tag]

export const getActionableParent = node => {
  if (!node.parent) return false
  if (node.parent.action) return node.parent
  return getActionableParent(node.parent)
}

export const getAllowedStyleKeys = node => {
  if (node.isCapture) {
    return ['base', 'focus', 'hover', 'disabled', 'placeholder', 'print']
  } else if (node.action || getActionableParent(node)) {
    return ['base', 'focus', 'hover', 'disabled', 'print']
  }
  return ['base', 'focus', 'print']
}

export const isList = node =>
  node && node.type === 'Block' && node.name === 'List'

export const isEmpty = list => list.length === 0

export const isValidImgSrc = (node, parent) =>
  node.name === 'source' && parent.name === 'Image' && parent.isBasic

export const pushImageToState = (state, scopedNames, paths) =>
  scopedNames.forEach(name => {
    const path = paths[scopedNames.findIndex(item => item === name)]
    if (!state.images.includes(path)) {
      state.images.push({
        name,
        file: path,
      })
    }
  })

export const getScopes = (node, parent) => {
  const scopedProps = getScopedProps(node, parent)
  if (!scopedProps) return false
  const paths = scopedProps.map(scope => scope.prop.value)
  const scopedNames = paths.map(path => toCamelCase(path))

  return { scopedProps, paths, scopedNames }
}

export const isSvg = node => /^Svg/.test(node.name) && node.isBasic

export const getScopeDescription = scope => {
  const dictionary = {}
  const re = /(?:^|\W)props.(\w+)(?!\w)/g

  let match = re.exec(scope)
  while (match) {
    dictionary[match[1]] = toSlugCase(match[1])
    match = re.exec(scope)
  }

  for (let key in dictionary) {
    scope = scope.replace(new RegExp(key, 'g'), dictionary[key])
  }

  return toCamelCase(
    scope
      .replace(/\|\|/g, '-or-')
      .replace(/!/g, 'not-')
      .replace(/&&/g, '-and-')
      .replace(/props\./g, '')
      .replace(/\s/g, '')
  )
}

export const hasCustomScopes = (propNode, blockNode) =>
  blockNode.scopes.some(
    scope =>
      !scope.isLocal &&
      !scope.isSystem &&
      scope.properties.some(prop => prop.name === propNode.name)
  )

export const hasLocals = (propNode, blockNode) =>
  blockNode.scopes.some(scope => scope.isLocal)

export const getLocals = (propNode, blockNode, state) => {
  const locals = {}

  blockNode.scopes.filter(scope => scope.isLocal).forEach(scope => {
    const prop = scope.properties.find(prop => prop.name === propNode.name)
    if (prop) {
      locals[scope.value] = prop.value
    }
  })

  return locals
}

export const makeOnClickTracker = (node, state) => {
  if (!state.track) return node.value

  const block = node.testId
    ? `"${state.name}.${node.testId}"`
    : `props["${state.testIdKey}"] || "${state.name}"`

  state.isTracking = true

  return `event => context.track({ block: ${block}, action: "click", callback: ${
    node.value
  }, event })`
}

export const hasAnimatedChild = node =>
  node.children && node.children.some(child => child.isAnimated)

const getDefaultValue = (node, name) => {
  const prop = node.properties.find(
    prop => prop.name === name || `"--${prop.name}` === name.split(/[0-9]/)[0]
  )
  return prop ? prop.value : ''
}

const getStandardAnimatedString = (node, prop, isNative) => {
  // TODO: fix this 😬
  if (typeof prop.value === 'number') {
    return `${
      isNative ? prop.name : `"--${prop.name}"`
    }: getAnimatedValue(this.animatedValue${getScopeIndex(
      node,
      prop.scope
    )}, ${getDefaultValue(node, prop.name)}, ${prop.value})`
  }
  return `${
    isNative ? prop.name : `"--${prop.name}"`
  }: getAnimatedValue(this.animatedValue${getScopeIndex(
    node,
    prop.scope
  )}, '${getDefaultValue(node, prop.name)}', '${prop.value}')`
}

const getTransformString = (node, transform) => {
  let transformStr = `transform: [`

  transform.props.forEach((prop, i) => {
    transformStr += `{${getAnimatedString(node, prop)}},`
  })

  return `${transformStr}]`
}

export const getScopeIndex = (node, currentScope) =>
  node.scopes.findIndex(scope => {
    return scope.slotName === currentScope
  })

export const isNewScope = (state, currentAnimation, index) =>
  index ===
  state.animations.findIndex(
    animation => animation.scope === currentAnimation.scope
  )

export const getAnimatedStyles = (node, isNative) => {
  const props = isNative
    ? getAllAnimatedProps(node, true)
    : getSpringProps(node)
  let animated = ''

  props.forEach((prop, i) => {
    if (i === 0) {
      animated += getAnimatedString(node, prop, isNative)
    } else {
      animated += `, ${getAnimatedString(node, prop, isNative)}`
    }
  })

  return animated
}

const getAnimatedString = (node, prop, isNative) =>
  prop.name === 'transform'
    ? getTransformString(node, prop)
    : getStandardAnimatedString(node, prop, isNative)

export const getNonAnimatedDynamicStyles = node => {
  const animatedProps = getAllAnimatedProps(node, true).map(prop => prop.name)

  const animatedTransforms = animatedProps.includes('transform')
    ? getAllAnimatedProps(node, true)
        .find(prop => prop.name === 'transform')
        .props.map(prop => prop.name)
    : []

  return Object.keys(node.style.dynamic.base)
    .filter(
      key => !animatedProps.includes(key) && !animatedTransforms.includes(key)
    )
    .reduce((obj, key) => {
      obj[key] = node.style.dynamic.base[key]
      return obj
    }, {})
}

export const hasSpringAnimation = node =>
  node.animations.some(anim => anim.curve === 'spring')

export const hasTimingAnimation = node =>
  node.animations.some(anim => anim.curve !== 'spring')

export const getAllAnimatedProps = (node, isNative) => {
  const props = flatten(
    node.scopes.map(scope => scope.properties.filter(prop => prop.animation))
  )
  return checkForTransforms(props) && isNative
    ? combineTransforms(props)
    : props
}

export const combineTransforms = props => {
  // TODO: handle transforms on different scopes
  let transform = { name: 'transform', props: [] }
  props.forEach((prop, i) => {
    if (TRANSFORM_WHITELIST[prop.name]) {
      prop.isTransform = true
      transform.props.push(prop)
    }
  })
  props.push(transform)
  return props.filter(prop => !prop.isTransform)
}

export const checkForTransforms = props =>
  props.some(prop => TRANSFORM_WHITELIST[prop.name])

export const getTimingProps = node =>
  flatten(
    node.scopes.map(scope =>
      scope.properties.filter(
        prop => prop.animation && prop.animation.curve !== 'spring'
      )
    )
  )

export const getSpringProps = node =>
  flatten(
    node.scopes.map(scope =>
      scope.properties.filter(
        prop => prop.animation && prop.animation.curve === 'spring'
      )
    )
  )

// https://github.com/facebook/react-native/blob/26684cf3adf4094eb6c405d345a75bf8c7c0bf88/Libraries/Animated/src/NativeAnimatedHelper.js
/**
 * Styles allowed by the native animated implementation.
 *
 * In general native animated implementation should support any numeric property that doesn't need
 * to be updated through the shadow view hierarchy (all non-layout properties).
 */
const STYLES_WHITELIST = {
  opacity: true,
  transform: true,
  /* ios styles */
  shadowOpacity: true,
  shadowRadius: true,
  /* legacy android transform properties */
  scaleX: true,
  scaleY: true,
  translateX: true,
  translateY: true,
}

const TRANSFORM_WHITELIST = {
  translateX: true,
  translateY: true,
  scale: true,
  scaleX: true,
  scaleY: true,
  rotate: true,
  rotateX: true,
  rotateY: true,
  perspective: true,
}

export const canUseNativeDriver = animation =>
  STYLES_WHITELIST[animation.name] ||
  TRANSFORM_WHITELIST[animation.name] ||
  false

const fontsOrder = ['eot', 'woff2', 'woff', 'ttf', 'svg', 'otf']

export const sortFonts = (a, b) =>
  fontsOrder.indexOf(b.type) - fontsOrder.indexOf(a.type)
