import safe from './react/safe.js'
import wrap from './react/wrap.js'
import toCamelCase from 'to-camel-case'
import toSlugCase from 'to-slug-case'
import flatten from 'flatten'

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
    .filter(scope => !scope.isSystem)
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

export const getScopedRequireCondition = (scopes, paths, defaultName) => {
  let conditional = `requireImage('${defaultName}')`

  scopes.forEach((scope, index) => {
    conditional =
      `${scope.when} ? requireImage('${paths[index]}') : ` + conditional
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

const getDefaultValue = (node, name) =>
  node.properties.find(
    prop => prop.name === name || `"--${prop.name}` === name.split(/[0-9]/)[0]
  ).value

const getAnimatedCssString = (node, prop) => {
  // TODO: fix this 😬
  if (typeof prop.value === 'number') {
    return `${prop.name}: getAnimatedValue(this.animatedValue${getScopeIndex(
      node,
      prop.scope
    )}, ${getDefaultValue(node, prop.name)}, ${prop.value})`
  }
  return `${prop.name}: getAnimatedValue(this.animatedValue${getScopeIndex(
    node,
    prop.scope
  )}, '${getDefaultValue(node, prop.name)}', '${prop.value}')`
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
    ? getAllAnimatedProps(node)
    : convertToVars(getSpringProps(node))
  let animated = ''

  props.forEach((prop, i) => {
    if (i === 0) {
      animated += getAnimatedCssString(node, prop)
    } else {
      animated += `, ${getAnimatedCssString(node, prop)}`
    }
  })

  return animated
}

export const getNonAnimatedDynamicStyles = node => {
  const animatedProps = getAllAnimatedProps(node).map(prop => prop.name)

  return Object.keys(node.style.dynamic.base)
    .filter(key => !animatedProps.includes(key))
    .reduce((obj, key) => {
      obj[key] = node.style.dynamic.base[key]
      return obj
    }, {})
}

export const hasSpringAnimation = node =>
  node.animations.some(anim => anim.curve === 'spring')

export const hasTimingAnimation = node =>
  node.animations.some(anim => anim.curve !== 'spring')

export const getAllAnimatedProps = node =>
  flatten(
    node.scopes.map(scope => scope.properties.filter(prop => prop.animation))
  )

export const getTimingProps = node =>
  flatten(
    node.scopes.map(scope =>
      scope.properties.filter(
        prop => prop.animation && prop.animation.curve !== 'spring'
      )
    )
  )

const getSpringProps = node =>
  flatten(
    node.scopes.map(scope =>
      scope.properties.filter(
        prop => prop.animation && prop.animation.curve === 'spring'
      )
    )
  )

const convertToVars = props => {
  // if there are duplicate properties, e.g. color on different scopes
  // they need to have unique variable names
  const propTypes = [...new Set(props.map(prop => prop.name))]
  let listsByType = []
  propTypes.forEach((type, i) => {
    listsByType[i] = props.filter(prop => prop.name === type)
  }, props)

  listsByType.forEach(propsList => {
    propsList.forEach((prop, index) => {
      return (prop.name = `"--${prop.name}${index++}"`)
    })
  })
  return props
}
