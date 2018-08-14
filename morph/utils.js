import flatten from 'flatten'
import safe from './react/safe.js'
import toCamelCase from 'to-camel-case'
import toSlugCase from 'to-slug-case'
import wrap from './react/wrap.js'
import getUnit from './get-unit.js'

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
  Array.isArray(obj)
    ? `[${obj.map(getObjectAsString)}]`
    : wrap(
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
    : typeof node.value === 'string'
      ? safe(node.value)
      : node.value

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

export const interpolateText = (node, parent, isTemplateLiteral) => {
  parent.interpolation.forEach(item => {
    const re = new RegExp(`${item.is ? item.is : item.name}`)
    const textNode = item.properties.find(prop => prop.name === 'text')
    node.value = isTemplateLiteral
      ? getLiteralInterpolation(node, re, textNode)
      : getStandardInterpolation(node, re, textNode, item)
  })
  return isTemplateLiteral ? '`' + node.value + '`' : node.value
}

const getLiteralInterpolation = (node, re, textNode) =>
  node.value.replace(
    re,
    `$${isSlot(textNode) ? wrap(textNode.value) : textNode.value}`
  )

const getStandardInterpolation = (node, re, textNode, item) =>
  node.value.replace(
    re,
    hasCustomScopes(textNode, item)
      ? wrap(getScopedCondition(textNode, item, true))
      : isSlot(textNode)
        ? wrap(textNode.value)
        : textNode.value
  )

export const getScopedCondition = (
  propNode,
  blockNode,
  alreadyInterpolated
) => {
  // alreadyInterpolated = interpolation that contains scoped condition
  // !alreadyInterpolated = scoped condition that contains interpolation
  // see tests in TextInterpolation.view for an example of both
  const scopedProps = getScopedProps(propNode, blockNode)

  if (!scopedProps) return false

  let conditional =
    blockNode.hasOwnProperty('interpolation') && !alreadyInterpolated
      ? interpolateText(propNode, blockNode, true)
      : maybeSafe(propNode)

  scopedProps.forEach(scope => {
    conditional =
      `${scope.when} ? ${
        blockNode.hasOwnProperty('interpolation') && !alreadyInterpolated
          ? interpolateText(scope.prop, blockNode, true)
          : maybeSafe(scope.prop)
      } : ` + conditional
  })

  const lastScope = scopedProps[scopedProps.length - 1]

  if (
    !lastScope.prop.animation ||
    lastScope.prop.animation.curve !== 'spring'
  ) {
    lastScope.prop.conditional = `\${${conditional}}`
  }

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
export const isRowStyle = node => isTag(node, 'rowStyle')
export const isTag = (node, tag) => node && node.tags[tag]

export const getActionableParent = node => {
  if (!node.parent) return false
  if (node.parent.action) return node.parent
  return getActionableParent(node.parent)
}

export const getAllowedStyleKeys = node => {
  if (node.isCapture) {
    return ['base', 'focus', 'hover', 'disabled', 'placeholder', 'print']
  } else if (node.action || isTable(node) || getActionableParent(node)) {
    return ['base', 'focus', 'hover', 'disabled', 'print']
  }
  return ['base', 'focus', 'print']
}

export const isList = node =>
  node && node.type === 'Block' && node.name === 'List'

export const isCell = node =>
  node.properties.some(prop => prop.name === 'isCell')

export const isHeader = node =>
  node.properties.some(prop => prop.name === 'isHeader')

export const isColumn = node =>
  node && node.type === 'Block' && node.name === 'Column'

export const isTable = node =>
  node && node.type === 'Block' && node.name === 'Table'

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

export const getLocalsString = (propNode, blockNode, state) => {
  const baseLocalName = `${blockNode.is || blockNode.name}Local`
  let localName = baseLocalName
  let index = 1
  while (localName in state.locals) {
    localName = `${baseLocalName}${index++}`
  }

  state.locals[localName] = getLocals(propNode, blockNode, state)
  return wrap(`${localName}[local.state.lang] || ${safe(propNode.value)}`)
}

export const makeOnClickTracker = (node, state) => {
  if (!state.track) return node.value

  const block = node.testId
    ? `"${state.name}.${node.testId}"`
    : `props["${state.testIdKey}"] || "${state.name}"`

  state.isTracking = true

  return `event => context.track({ block: ${block}, action: "click", callback: ${
    node.value
  }, event, props })`
}

// const isRotate = name =>
//   name === 'rotate' || name === 'rotateX' || name === 'rotateY'

const getStandardAnimatedString = (node, prop, isNative) => {
  let value = `animated${node.id}${
    prop.animationIndexOnBlock > 0 ? prop.animationIndexOnBlock : ''
  }.${prop.name}`

  // const unit = getUnit(prop)
  // if (unit) {
  //   value = `\`\${${value}}${unit}\``
  // }

  return `${isNative ? prop.name : `"--${prop.name}"`}: ${value}`
}

const getTransformString = (node, transform, isNative) => {
  let transformStr = `transform: [`

  transform.props.forEach((prop, i) => {
    transformStr += `{${getAnimatedString(node, prop, isNative)}},`
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

  return props.map(prop => getAnimatedString(node, prop, isNative)).join(', ')
}

const getPropValue = (prop, interpolateValue = true) => {
  const unit = getUnit(prop)
  return unit
    ? interpolateValue
      ? `\`\${${prop.value}}${unit}\``
      : `"${prop.value}${unit}"`
    : prop.value
}

const propIsScoped = (prop, scopedSlots) =>
  scopedSlots.some(scopedSlot => RegExp(`^${prop.name}`).test(scopedSlot))

export const getDynamicStyles = node => {
  const scopedSlots = flatten([
    node.scopes.map(scope =>
      scope.properties
        .map(prop => prop.name !== 'when' && prop.tags.slot && prop.name)
        .filter(Boolean)
    ),
  ])

  return flatten([
    node.properties
      .filter(
        prop =>
          prop.tags.style && prop.tags.slot && !propIsScoped(prop, scopedSlots)
      )
      .map(prop => `'--${prop.name}': ${getPropValue(prop)}`),
    node.scopes.map(scope => {
      return scope.properties.map(prop => {
        const unit = getUnit(prop)
        return (
          (prop.tags.style &&
            prop.conditional &&
            `'--${prop.name}': \`${prop.conditional}${unit}\``) ||
          (prop.tags.style &&
            prop.tags.slot &&
            prop.scope === 'hover' &&
            `'--${prop.name}': ${getPropValue(prop)}`)
        )
      })
    }),
  ]).filter(Boolean)
}

const getAnimatedString = (node, prop, isNative) =>
  prop.name === 'transform'
    ? getTransformString(node, prop, isNative)
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

export const getAllAnimatedProps = (node, isNative) => {
  const props = flatten(
    node.scopes.map(scope => scope.properties.filter(prop => prop.animation))
  )
  return checkForTransforms(props) && isNative
    ? combineTransforms(props)
    : props
}

const combineTransforms = props => {
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

const checkForTransforms = props =>
  props.some(prop => TRANSFORM_WHITELIST[prop.name])

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

export const canUseNativeDriver = name =>
  STYLES_WHITELIST[name] || TRANSFORM_WHITELIST[name] || false

const fontsOrder = ['eot', 'woff2', 'woff', 'ttf', 'svg', 'otf']

export const sortFonts = (a, b) =>
  fontsOrder.indexOf(b.type) - fontsOrder.indexOf(a.type)

export const createId = (node, state, addClassName = true) => {
  let id = node.is || node.name
  // count repeatead ones
  if (state.usedBlockNames[id]) {
    id = `${id}${state.usedBlockNames[id]++}`
  } else {
    state.usedBlockNames[id] = 1
  }

  node.styleName = id
  if (addClassName && node.className) {
    node.className.push(`\${${id}}`)
  }

  return id
}

const CONTENT_CONTAINER_STYLE_PROPS = [
  'paddingTop',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
  'flexDirection',
  'justifyContent',
  'alignItems',
]

const isContentContainerStyleProp = prop =>
  CONTENT_CONTAINER_STYLE_PROPS.includes(prop)

export const hasContentContainerStyleProp = styleProps =>
  Object.keys(styleProps).some(isContentContainerStyleProp)

export const getContentContainerStyleProps = styleProps =>
  Object.keys(styleProps)
    .filter(isContentContainerStyleProp)
    .reduce((obj, key) => {
      obj[key] = styleProps[key]
      return obj
    }, {})

export const removeContentContainerStyleProps = styleProps =>
  Object.keys(styleProps)
    .filter(key => !isContentContainerStyleProp(key))
    .reduce((obj, key) => {
      obj[key] = styleProps[key]
      return obj
    }, {})

export const hasRowStyles = node =>
  node.properties.some(
    prop => prop.name.match(/^row/) && prop.name !== 'rowHeight'
  )
