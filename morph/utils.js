import flatten from 'flatten'
import safe from './react/safe.js'
import toCamelCase from 'to-camel-case'
import toSlugCase from 'to-slug-case'
import wrap from './react/wrap.js'
import getUnit from './get-unit.js'

let safeScope = value =>
  typeof value === 'string' && !isSlot(value) ? JSON.stringify(value) : value

export let checkParentStem = (node, styleKey) => {
  if (
    styleKey !== 'isHovered' ||
    styleKey !== 'isDisabled' ||
    styleKey !== 'isSelected' ||
    !node.parent
  )
    return false

  let matchingParentStem = node.parent.scopes.some(
    scope => scope.value === styleKey
  )

  return matchingParentStem && (node.parent.is || node.parent.name)
}

let INTERPOLATION = /\${(.+)}/
export let isInterpolation = str => INTERPOLATION.test(str)
export let deinterpolate = str => {
  let match = str.match(INTERPOLATION)
  return match ? match[1] : str
}

export let getObjectAsString = obj =>
  Array.isArray(obj)
    ? `[${obj.map(getObjectAsString)}]`
    : wrap(
        Object.keys(obj)
          .map(k => {
            let v =
              typeof obj[k] === 'object' && hasKeys(obj[k])
                ? getObjectAsString(obj[k])
                : obj[k]
            return `${JSON.stringify(k)}: ${v}`
          })
          .join(',')
      )

export let getPropertiesAsObject = list => {
  let obj = {}

  list.forEach(prop => {
    obj[prop.name] = safeScope(prop.value)
  })

  return getObjectAsString(obj)
}

export let getProp = (node, key) => {
  let finder =
    typeof key === 'string' ? p => p.name === key : p => key.test(p.name)

  return node.properties && node.properties.find(finder)
}

export let getPropValueOrDefault = (node, key, defaultValue) => {
  return hasProp(node, key) ? getProp(node, key).value : defaultValue
}

export let getScope = node => node.value.split('when ')[1]

let maybeSafe = node =>
  node.tags.slot
    ? node.value
    : typeof node.value === 'string'
    ? safe(node.value)
    : node.value

let getScopedProps = (propNode, blockNode) => {
  let scopes = blockNode.scopes
    .filter(scope => !scope.isSystem && !scope.isLocal)
    .map(scope => {
      let prop = scope.properties.find(prop => prop.name === propNode.name)
      return prop && { prop, when: scope.value }
    })
    .filter(Boolean)
    .reverse()

  if (isEmpty(scopes)) return false

  return scopes
}

// export let interpolateText = (node, parent, isTemplateLiteral) => {
//   parent.interpolation.forEach(item => {
//     let re = new RegExp(`${item.is ? item.is : item.name}`)
//     let textNode = item.properties.find(prop => prop.name === 'text')
//     node.value = isTemplateLiteral
//       ? getLiteralInterpolation(node, re, textNode)
//       : getStandardInterpolation(node, re, textNode, item)
//   })
//   return isTemplateLiteral ? '`' + node.value + '`' : node.value
// }

// let getLiteralInterpolation = (node, re, textNode) =>
//   node.value.replace(
//     re,
//     `$${isSlot(textNode) ? wrap(textNode.value) : textNode.value}`
//   )

// let getStandardInterpolation = (node, re, textNode, item) =>
//   node.value.replace(
//     re,
//     hasCustomScopes(textNode, item)
//       ? wrap(getScopedCondition(textNode, item, true))
//       : isSlot(textNode)
//       ? wrap(textNode.value)
//       : textNode.value
//   )

export let getScopedCondition = (propNode, blockNode, alreadyInterpolated) => {
  // alreadyInterpolated = interpolation that contains scoped condition
  // !alreadyInterpolated = scoped condition that contains interpolation
  // see tests in TextInterpolation.view for an example of both
  let scopedProps = getScopedProps(propNode, blockNode)

  if (!scopedProps) return false

  // let conditional =
  //   blockNode.hasOwnProperty('interpolation') && !alreadyInterpolated
  //     ? interpolateText(propNode, blockNode, true)
  //     : maybeSafe(propNode)
  let conditional = maybeSafe(propNode)

  scopedProps.forEach(scope => {
    conditional = `${scope.when} ? ${maybeSafe(scope.prop)} : ` + conditional

    // conditional =
    //   `${scope.when} ? ${
    //     blockNode.hasOwnProperty('interpolation') && !alreadyInterpolated
    //       ? interpolateText(scope.prop, blockNode, true)
    //       : maybeSafe(scope.prop)
    //   } : ` + conditional
  })

  let lastScope = scopedProps[scopedProps.length - 1]

  if (
    !lastScope.prop.animation ||
    lastScope.prop.animation.curve !== 'spring'
  ) {
    lastScope.prop.conditional = `\${${conditional}}`
  }

  return conditional
}

export let getScopedImageCondition = (scopes, scopedNames, defaultName) => {
  let conditional = defaultName

  scopes.forEach((scope, index) => {
    conditional = `${scope.when} ? ${scopedNames[index]} : ` + conditional
  })

  return conditional
}

let styleStems = [
  'isHovered',
  'isFocused',
  'isPlaceholder',
  'isDisabled',
  'isSelected',
]
export let getStyleType = node =>
  styleStems.find(tag => isTag(node, tag)) || 'base'
export let hasKeys = obj => Object.keys(obj).length > 0
export let hasKeysInChildren = obj =>
  Object.keys(obj).some(k => hasKeys(obj[k]))

export let hasProp = (node, key, match) => {
  let prop = getProp(node, key)
  if (!prop) return false
  return typeof match === 'function' ? match(prop.value) : true
}

export let hasDefaultProp = (node, parent) =>
  parent.properties.some(prop => prop.nameRaw === node.nameRaw)

export let isSlot = node =>
  typeof node === 'string' ? /props/.test(node) : isTag(node, 'slot')
export let isStyle = node => isTag(node, 'style')
export let isRowStyle = node => isTag(node, 'rowStyle')
export let isTag = (node, tag) => node && node.tags[tag]

export let getActionableParent = node => {
  if (!node.parent) return false
  if (node.parent.action) return node.parent
  return getActionableParent(node.parent)
}

export let getAllowedStyleKeys = node => {
  if (node.isCapture) {
    return ['base', 'isFocused', 'isHovered', 'isDisabled', 'isPlaceholder']
  } else if (node.action || isTable(node) || getActionableParent(node)) {
    return ['base', 'isFocused', 'isHovered', 'isDisabled', 'isSelected']
  }
  return ['base', 'isFocused']
}

export let isList = node =>
  node && node.type === 'Block' && node.name === 'List'

export let isCell = node => node.properties.some(prop => prop.name === 'isCell')

export let isHeader = node =>
  node.properties.some(prop => prop.name === 'isHeader')

export let isColumn = node =>
  node && node.type === 'Block' && node.name === 'Column'

export let isTable = node =>
  node && node.type === 'Block' && node.name === 'Table'

export let isEmpty = list => list.length === 0

export let isValidImgSrc = (node, parent) =>
  node.name === 'source' && parent.name === 'Image' && parent.isBasic

export let pushImageToState = (state, scopedNames, paths) =>
  scopedNames.forEach(name => {
    let path = paths[scopedNames.findIndex(item => item === name)]
    if (!state.images.includes(path)) {
      state.images.push({
        name,
        file: path,
      })
    }
  })

export let getScopes = (node, parent) => {
  let scopedProps = getScopedProps(node, parent)
  if (!scopedProps) return false
  let paths = scopedProps.map(scope => scope.prop.value)
  let scopedNames = paths.map(path => toCamelCase(path))

  return { scopedProps, paths, scopedNames }
}

export let isSvg = node => /^Svg/.test(node.name) && node.isBasic

export let hasCustomScopes = (propNode, blockNode) =>
  blockNode.scopes.some(
    scope =>
      !scope.isLocal &&
      !scope.isSystem &&
      scope.properties.some(prop => prop.name === propNode.name)
  )

export let hasLocals = (propNode, blockNode) =>
  blockNode.scopes.some(scope => scope.isLocal)

export let getLocals = (propNode, blockNode, state) => {
  let locals = {}

  blockNode.scopes
    .filter(scope => scope.isLocal)
    .forEach(scope => {
      let prop = scope.properties.find(prop => prop.name === propNode.name)
      if (prop) {
        locals[scope.value] = prop.value
      }
    })

  return locals
}

export let getLocalsString = (propNode, blockNode, state) => {
  let baseLocalName = `${blockNode.is || blockNode.name}Local`
  let localName = baseLocalName
  let index = 1
  while (localName in state.locals) {
    localName = `${baseLocalName}${index++}`
  }

  state.locals[localName] = getLocals(propNode, blockNode, state)
  return wrap(`${localName}[local.state.lang] || ${safe(propNode.value)}`)
}

export let makeOnClickTracker = (node, parent, state) => {
  if (!state.track) return node.value

  let block = parent.testId
    ? `"${state.name}.${parent.testId}"`
    : `props["${state.testIdKey}"] || "${state.name}"`

  state.isTracking = true

  return `event => {
    typeof ${node.value} === 'function' && ${node.value}(event);

    track({ block: ${block}, action: "click", event, props });
  }`
}

// let isRotate = name =>
//   name === 'rotate' || name === 'rotateX' || name === 'rotateY'

let getStandardAnimatedString = (node, prop, isNative) => {
  let value = `animated${node.id}${
    prop.animationIndexOnBlock > 0 ? prop.animationIndexOnBlock : ''
  }.${prop.name}`

  // let unit = getUnit(prop)
  // if (unit) {
  //   value = `\`\${${value}}${unit}\``
  // }

  return `${isNative ? prop.name : `"--${prop.name}"`}: ${value}`
}

let getTransformString = (node, transform, isNative) => {
  let transformStr = `transform: [`

  transform.props.forEach((prop, i) => {
    transformStr += `{${getAnimatedString(node, prop, isNative)}},`
  })

  return `${transformStr}]`
}

export let getScopeIndex = (node, currentScope) =>
  node.scopes.findIndex(scope => {
    return scope.slotName === currentScope
  })

export let isNewScope = (state, currentAnimation, index) =>
  index ===
  state.animations.findIndex(
    animation => animation.scope === currentAnimation.scope
  )

export let getAnimatedStyles = (node, isNative) => {
  let props = isNative ? getAllAnimatedProps(node, true) : getSpringProps(node)

  return props.map(prop => getAnimatedString(node, prop, isNative)).join(', ')
}

let getPropValue = (prop, interpolateValue = true) => {
  let unit = getUnit(prop)
  if (unit) {
    let value = interpolateValue
      ? `\`\${${prop.value}}${unit}\``
      : `"${prop.value}${unit}"`
    return `typeof ${prop.value} === 'number' ? ${value} : ${prop.value}`
  } else {
    return prop.value
  }
}

export let getDynamicStyles = node => {
  return flatten([
    node.properties
      .filter(
        prop => prop.tags.style && prop.tags.slot && !getScopedProps(prop, node)
      )
      .map(prop => `'--${prop.name}': ${getPropValue(prop)}`),
    node.scopes.map(scope =>
      scope.properties.map(prop => {
        let unit = getUnit(prop)
        return (
          (prop.tags.style &&
            prop.conditional &&
            `'--${prop.name}': \`${prop.conditional}${unit}\``) ||
          (prop.tags.style &&
            prop.tags.slot &&
            prop.scope === 'isHovered' &&
            `'--${prop.name}': ${getPropValue(prop)}`)
        )
      })
    ),
  ]).filter(Boolean)
}

let getAnimatedString = (node, prop, isNative) =>
  prop.name === 'transform'
    ? getTransformString(node, prop, isNative)
    : getStandardAnimatedString(node, prop, isNative)

export let getNonAnimatedDynamicStyles = node => {
  let animatedProps = getAllAnimatedProps(node, true).map(prop => prop.name)
  let animatedTransforms = animatedProps.includes('transform')
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

export let getAllAnimatedProps = (node, isNative) => {
  let props = flatten(
    node.scopes.map(scope => scope.properties.filter(prop => prop.animation))
  )
  return checkForTransforms(props) && isNative
    ? combineTransforms(props)
    : props
}

let combineTransforms = props => {
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

let checkForTransforms = props =>
  props.some(prop => TRANSFORM_WHITELIST[prop.name])

export let getTimingProps = node =>
  flatten(
    node.scopes.map(scope =>
      scope.properties.filter(
        prop => prop.animation && prop.animation.curve !== 'spring'
      )
    )
  )

let getSpringProps = node =>
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
let STYLES_WHITELIST = {
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

let TRANSFORM_WHITELIST = {
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

export let canUseNativeDriver = name =>
  STYLES_WHITELIST[name] || TRANSFORM_WHITELIST[name] || false

export let createId = (node, state, addClassName = true) => {
  let id = node.is || node.name
  // count repeatead ones
  if (state.usedBlockNames[id]) {
    id = `${id}${state.usedBlockNames[id]++}`
  } else {
    state.usedBlockNames[id] = 1
  }

  node.styleName = id
  if (addClassName && node.className) {
    node.className.push(`\${styles.${id}}`)
  }

  return id
}

let CONTENT_CONTAINER_STYLE_PROPS = [
  'paddingTop',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
  'flexDirection',
  'justifyContent',
  'alignItems',
]

let isContentContainerStyleProp = prop =>
  CONTENT_CONTAINER_STYLE_PROPS.includes(prop)

export let hasContentContainerStyleProp = styleProps =>
  Object.keys(styleProps).some(isContentContainerStyleProp)

export let getContentContainerStyleProps = styleProps =>
  Object.keys(styleProps)
    .filter(isContentContainerStyleProp)
    .reduce((obj, key) => {
      obj[key] = styleProps[key]
      return obj
    }, {})

export let removeContentContainerStyleProps = styleProps =>
  Object.keys(styleProps)
    .filter(key => !isContentContainerStyleProp(key))
    .reduce((obj, key) => {
      obj[key] = styleProps[key]
      return obj
    }, {})

export let hasRowStyles = node =>
  node.properties.some(
    prop => prop.name.match(/^row/) && prop.name !== 'rowHeight'
  )

let MAYBE_HYPHENATED_STYLE_PROPS = [
  'alignContent',
  'alignItems',
  'alignSelf',
  'backgroundBlendMode',
  'backgroundClip',
  'backgroudOrigin',
  'backgroundRepeat',
  'boxSizing',
  'clear',
  'cursor',
  'flexBasis',
  'flexDirection',
  'flexFlow',
  'flexWrap',
  'float',
  'fontFamily',
  'fontStretch',
  'justifyContent',
  'objectFit',
  'overflowWrap',
  'textAlign',
  'textDecorationLine',
  'textTransform',
  'whiteSpace',
  'wordBreak',
]

export let maybeMakeHyphenated = ({ name, value }) =>
  MAYBE_HYPHENATED_STYLE_PROPS.includes(name) && /^[a-zA-Z]+$/.test(value)
    ? toSlugCase(value)
    : value

export let isStory = (node, state) =>
  !node.isBasic && state.isStory(node.name) && state.flow === 'separate'
