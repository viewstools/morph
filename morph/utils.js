import flatten from 'flatten'
import getUnit from './get-unit.js'
import safe from './react/safe.js'
import toCamelCase from 'to-camel-case'
import toSlugCase from 'to-slug-case'
import toSnakeCase from 'to-snake-case'
import path from 'path'
import wrap from './react/wrap.js'

let safeScope = (value) =>
  typeof value === 'string' && !isSlot(value) ? JSON.stringify(value) : value

export let checkParentStem = (node, styleKey) => {
  if (
    styleKey !== 'isHovered' ||
    styleKey !== 'isDisabled' ||
    styleKey !== 'isSelected' ||
    styleKey !== 'isSelectedHovered' ||
    !node.parent
  )
    return false

  let matchingParentStem = node.parent.scopes.some(
    (scope) => scope.value === styleKey
  )

  return matchingParentStem && (node.parent.is || node.parent.name)
}

let INTERPOLATION = /\${(.+)}/
export let isInterpolation = (str) => INTERPOLATION.test(str)
export let deinterpolate = (str) => {
  let match = str.match(INTERPOLATION)
  return match ? match[1] : str
}

export let getObjectAsString = (obj) =>
  Array.isArray(obj)
    ? `[${obj.map(getObjectAsString)}]`
    : wrap(
        Object.keys(obj)
          .map((k) => {
            let v =
              typeof obj[k] === 'object' && hasKeys(obj[k])
                ? getObjectAsString(obj[k])
                : obj[k]
            return `${JSON.stringify(k)}: ${v}`
          })
          .join(',')
      )

export let getPropertiesAsObject = (list) => {
  let obj = {}

  list.forEach((prop) => {
    obj[prop.name] = safeScope(prop.value)
  })

  return getObjectAsString(obj)
}

export let getProp = (node, key, scope = 'base') => {
  let finder =
    typeof key === 'string' ? (p) => p.name === key : (p) => key.test(p.name)

  if (scope !== 'base') {
    let nodeScope = node.scopes.find((item) => item.value === scope)
    let prop = nodeScope && nodeScope.properties.find(finder)
    if (prop) {
      return prop
    }
  }

  return node.properties && node.properties.find(finder)
}

export let getPropValueOrDefault = (node, key, defaultValue) => {
  return hasProp(node, key) ? getProp(node, key).value : defaultValue
}

export let getScope = (node) => node.value.split('when ')[1]

let getScopedProps = (propNode, blockNode) => {
  let scopes = blockNode.scopes
    .filter((scope) => !scope.isSystem)
    .map((scope) => {
      let prop = scope.properties.find((prop) => prop.name === propNode.name)
      return prop && { prop, when: scope.value, scope }
    })
    .filter(Boolean)
    .reverse()

  if (isEmpty(scopes)) return false

  return scopes
}

function getScopedConditionPropValue(node, parent, state) {
  let value = null

  if (/^on[A-Z]/.test(node.name) && node.slotName === 'setFlowTo') {
    let flowPath = getFlowPath(node, parent, state)
    state.use('ViewsUseFlow')
    state.setFlowTo = true

    return `() => setFlowTo(${flowPath})`
  } else if (node.tags.designToken) {
    value = node.tags.slot
      ? `${node.value.replace('props.', '')} || ${
          state.designTokenVariableName[node.defaultValue]
        }`
      : state.designTokenVariableName[node.value.replace('props.', '')]
  } else if (node.tags.slot) {
    value = node.value
  } else if (typeof node.value === 'string') {
    value = safe(node.value)
  } else if (typeof node.value === 'boolean' && node.name === 'shadowInset') {
    value = node.value ? "'inset'" : "''"
  } else {
    let unit = getUnit(node)
    value = unit ? `"${node.value}${unit}"` : node.value
  }

  return value
}

let CHILD_VALUES = /!?props\.(isSelected|isHovered|isFocused|isSelectedHovered)/
let DATA_VALUES = /!?props\.(isInvalid|isInvalidInitial|isValid|isValidInitial|isSubmitting|value|onSubmit|onChange)$/
let IS_HOVERED_OR_SELECTED_HOVER = /!?props\.(isHovered|isSelectedHovered)/
let IS_FLOW = /!?props\.(isFlow|flow)$/
export function isFlow(prop) {
  return IS_FLOW.test(prop)
}
export function getScopedName({ name, blockNode, propNode, scope, state }) {
  let data = getDataForLoc(blockNode, propNode?.loc)
  if (data && DATA_VALUES.test(name)) {
    return replacePropWithDataValue(name, data)
  } else if (
    blockNode &&
    hasCustomBlockParent(blockNode) &&
    CHILD_VALUES.test(name)
  ) {
    return name.replace('props.', 'childProps.')
  } else if (isFlow(name)) {
    let flowPath = getFlowPath(scope, blockNode, state)
    state.use('ViewsUseFlow')
    state.useFlowHas = true
    return name.replace(/props\.(isFlow|flow)/, `flow.has(${flowPath})`)
  } else if (
    blockNode &&
    (blockNode.action || !!getActionableParent(blockNode)) &&
    IS_HOVERED_OR_SELECTED_HOVER.test(name)
  ) {
    return name.replace('props.', '')
  } else {
    return name
  }
}

export function getScopedCondition(propNode, blockNode, state) {
  let scopedProps = getScopedProps(propNode, blockNode)

  if (!scopedProps) return false

  let conditional = getScopedConditionPropValue(propNode, blockNode, state)
  scopedProps.forEach((scope) => {
    let when = getScopedName({
      name: scope.when,
      blockNode,
      propNode: scope.prop,
      scope: scope.scope,
      state,
    })

    conditional = `${when} ? ${getScopedConditionPropValue(
      scope.prop,
      blockNode,
      state
    )} : ${conditional}`
  })

  let lastScope = scopedProps[scopedProps.length - 1]

  if (
    !lastScope.prop.animation ||
    lastScope.prop.animation.curve !== 'spring'
  ) {
    lastScope.prop.conditional = conditional
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
  'isSelectedHovered',
]
export let getStyleType = (node) =>
  styleStems.find((tag) => isTag(node, tag)) || 'base'
export let hasKeys = (obj) => Object.keys(obj).length > 0
export let hasKeysInChildren = (obj) =>
  Object.keys(obj).some((k) => hasKeys(obj[k]))

export let hasProp = (node, key, match) => {
  let prop = getProp(node, key)
  if (!prop) return false
  return typeof match === 'function' ? match(prop.value) : true
}

export let hasDefaultProp = (node, parent) =>
  parent.properties.some((prop) => prop.nameRaw === node.nameRaw)

export let isSlot = (maybeNode1, maybeNode2) => {
  let node = maybeNode2 || maybeNode1

  return typeof node === 'string'
    ? /(flow\.|isHovered|childProps|props|isBefore|isMedia\.|Data\d*$)/.test(
        node
      )
    : isTag(node, 'slot') ||
        (node?.name && /^on[A-Z]/.test(node.name) && node.source)
}

export let isStyle = (node) => isTag(node, 'style')
export let isRowStyle = (node) => isTag(node, 'rowStyle')
export let isTag = (node, tag) => node && node.tags[tag]

export let getActionableParent = (node) => {
  if (!node.parent) return false
  if (node.parent.action) return node.parent
  return getActionableParent(node.parent)
}

export let hasCustomBlockParent = (node) => {
  if (!node.parent) return !node.isBasic
  if (!node.parent.isBasic) return true
  return hasCustomBlockParent(node.parent)
}

export let getAllowedStyleKeys = (node) => {
  if (node.isCapture) {
    return ['base', 'isFocused', 'isHovered', 'isDisabled', 'isPlaceholder']
  } else if (node.action || isTable(node) || getActionableParent(node)) {
    return [
      'base',
      'isFocused',
      'isHovered',
      'isDisabled',
      'isSelected',
      'isSelectedHovered',
    ]
  }
  return ['base', 'isFocused']
}

export let isList = (node) =>
  node && node.type === 'Block' && node.name === 'List'

export let isCell = (node) =>
  node.properties.some((prop) => prop.name === 'isCell')

export let isHeader = (node) =>
  node.properties.some((prop) => prop.name === 'isHeader')

export let isColumn = (node) =>
  node && node.type === 'Block' && node.name === 'Column'

export let isTable = (node) =>
  node && node.type === 'Block' && node.name === 'Table'

export let isEmpty = (list) => list.length === 0

export let isValidImgSrc = (node, parent) =>
  node.name === 'source' && parent.name === 'Image' && parent.isBasic

export let pushImageToState = (state, scopedNames, paths) =>
  scopedNames.forEach((name) => {
    let path = paths[scopedNames.findIndex((item) => item === name)]
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
  let paths = scopedProps.map((scope) => scope.prop.value)
  let scopedNames = paths.map((path) => toCamelCase(path))

  return { scopedProps, paths, scopedNames }
}

export let isSvg = (node) => /^Svg/.test(node.name) && node.isBasic

export let hasCustomScopes = (propNode, blockNode) =>
  blockNode.scopes.some(
    (scope) =>
      !scope.isSystem &&
      scope.properties.some((prop) => prop.name === propNode.name)
  )

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
  node.scopes.findIndex((scope) => {
    return scope.slotName === currentScope
  })

export let isNewScope = (state, currentAnimation, index) =>
  index ===
  state.animations.findIndex(
    (animation) => animation.scope === currentAnimation.scope
  )

export let getAnimatedStyles = (node, isNative) => {
  let props = isNative ? getAllAnimatedProps(node, true) : getSpringProps(node)

  return props.map((prop) => getAnimatedString(node, prop, isNative)).join(', ')
}

function getPropValue(prop, blockNode, interpolateValue = true, state) {
  let propValue = prop.value
  let data = getDataForLoc(blockNode, prop?.loc)
  if (data) {
    let propToReplace = prop.value.startsWith('props.')
      ? prop.value
      : `props.${prop.value}`

    if (DATA_VALUES.test(propToReplace)) {
      propValue = replacePropWithDataValue(propToReplace, data)
    }
  } else if (prop.tags.designToken) {
    propValue = prop.tags.slot
      ? `${prop.value.replace('props.', '')} || ${
          state.designTokenVariableName[prop.defaultValue]
        }`
      : state.designTokenVariableName[prop.value.replace('props.', '')]
  }

  let unit = getUnit(prop)
  if (unit) {
    let value = interpolateValue
      ? `\`\${${propValue}}${unit}\``
      : `"${propValue}${unit}"`
    return `typeof ${propValue} === 'number' ? ${value} : ${propValue}`
  } else {
    return propValue
  }
}

export let getDynamicStyles = (node, state) => {
  return flatten([
    node.properties
      .filter(
        (prop) =>
          prop.tags.style &&
          (prop.tags.slot || prop.tags.designToken) &&
          !getScopedProps(prop, node)
      )
      .map(
        (prop) => `'--${prop.name}': ${getPropValue(prop, node, true, state)}`
      ),
    node.scopes.map((scope) =>
      scope.properties
        .filter((prop) => prop.tags.style)
        .map((prop) => {
          let value = null

          if (prop.conditional) {
            value = prop.conditional
            // } else if (prop.tags.slot && prop.scope === 'isHovered') {
            //   value = getPropValue(prop)
          }

          return value && `'--${prop.name}': ${value}`
        })
    ),
  ]).filter(Boolean)
}

let getAnimatedString = (node, prop, isNative) =>
  prop.name === 'transform'
    ? getTransformString(node, prop, isNative)
    : getStandardAnimatedString(node, prop, isNative)

export let getNonAnimatedDynamicStyles = (node) => {
  let animatedProps = getAllAnimatedProps(node, true).map((prop) => prop.name)
  let animatedTransforms = animatedProps.includes('transform')
    ? getAllAnimatedProps(node, true)
        .find((prop) => prop.name === 'transform')
        .props.map((prop) => prop.name)
    : []

  return Object.keys(node.style.dynamic.base)
    .filter(
      (key) => !animatedProps.includes(key) && !animatedTransforms.includes(key)
    )
    .reduce((obj, key) => {
      obj[key] = node.style.dynamic.base[key]
      return obj
    }, {})
}

export let getAllAnimatedProps = (node, isNative) => {
  let props = flatten(
    node.scopes.map((scope) =>
      scope.properties.filter((prop) => prop.animation)
    )
  )
  return checkForTransforms(props) && isNative
    ? combineTransforms(props)
    : props
}

let combineTransforms = (props) => {
  // TODO: handle transforms on different scopes
  let transform = { name: 'transform', props: [] }
  props.forEach((prop, i) => {
    if (TRANSFORM_WHITELIST[prop.name]) {
      prop.isTransform = true
      transform.props.push(prop)
    }
  })
  props.push(transform)
  return props.filter((prop) => !prop.isTransform)
}

let checkForTransforms = (props) =>
  props.some((prop) => TRANSFORM_WHITELIST[prop.name])

export let getTimingProps = (node) =>
  flatten(
    node.scopes.map((scope) =>
      scope.properties.filter(
        (prop) => prop.animation && prop.animation.curve !== 'spring'
      )
    )
  )

let getSpringProps = (node) =>
  flatten(
    node.scopes.map((scope) =>
      scope.properties.filter(
        (prop) => prop.animation && prop.animation.curve === 'spring'
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

export let canUseNativeDriver = (name) =>
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

let isContentContainerStyleProp = (prop) =>
  CONTENT_CONTAINER_STYLE_PROPS.includes(prop)

export let hasContentContainerStyleProp = (styleProps) =>
  Object.keys(styleProps).some(isContentContainerStyleProp)

export let getContentContainerStyleProps = (styleProps) =>
  Object.keys(styleProps)
    .filter(isContentContainerStyleProp)
    .reduce((obj, key) => {
      obj[key] = styleProps[key]
      return obj
    }, {})

export let removeContentContainerStyleProps = (styleProps) =>
  Object.keys(styleProps)
    .filter((key) => !isContentContainerStyleProp(key))
    .reduce((obj, key) => {
      obj[key] = styleProps[key]
      return obj
    }, {})

export let hasRowStyles = (node) =>
  node.properties.some(
    (prop) => prop.name.match(/^row/) && prop.name !== 'rowHeight'
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

export let isViewSeparate = (node, state) =>
  !node.isBasic && state.isView(node.name) && state.flow === 'separate'

export function getFlowPath(node, parent, state) {
  // TODO morph to useFlowValue and do a lookup
  // TODO warn if action is used but it isn't in actions (on parser)
  // TODO warn that there's setFlowTo without an id (on parser)
  let setFlowTo = node.defaultValue
  return setFlowTo.startsWith('/')
    ? JSON.stringify(setFlowTo)
    : `fromFlow.normalizePath(props.viewPath, '${setFlowTo}')`
}

/**
 *
 * Returns the closest data key which will apply for a given location in the block
 *
 */
export function getDataForLoc(blockNode, loc) {
  if (!loc) return null
  return (
    blockNode.data
      // the data should be defined before the current line
      .filter((data) => data.loc.start.line < loc.start.line)
      .sort((a, b) => b.loc.start.line - a.loc.start.line)?.[0]
  )
}

export function replacePropWithDataValue(value, dataGroup) {
  let propValue = value.replace('props.', '')
  if (dataGroup.aggregate) {
    if (propValue === 'value') {
      return dataGroup.name
    } else if (propValue === '!value') {
      return `!${dataGroup.name}`
    } else {
      throw new Error(
        `Property ${propValue} is not available on aggregate data, only "value" is a valid option`
      )
    }
  } else if (dataGroup.data[0].isConstant) {
    if (propValue === 'value') {
      return dataGroup.data[0].name
    } else if (propValue === '!value') {
      return `!${dataGroup.data[0].name}`
    } else {
      throw new Error(
        `Property ${propValue} is not available on constant data, only "value" is a valid option`
      )
    }
  } else {
    if (propValue === 'isInvalid') return `!${dataGroup.variables['isValid']}`
    if (propValue === '!isInvalid') return `${dataGroup.variables['isValid']}`
    if (propValue === 'isInvalidInitial')
      return `!${dataGroup.variables['isValidInitial']}`
    if (propValue === '!isInvalidInitial')
      return `${dataGroup.variables['isValidInitial']}`
    if (propValue.startsWith('!'))
      return `!${dataGroup.variables[propValue.substring(1)]}`
    return dataGroup.variables[propValue]
  }
}

let PROP_TO_USE_DATA = {
  isInvalid: 'useDataIsValid',
  isInvalidInitial: 'useDataIsValidInitial',
  isValid: 'useDataIsValid',
  isValidInitial: 'useDataIsValidInitial',
  isSubmitting: 'useDataIsSubmitting',
  value: 'useDataValue',
  onSubmit: 'useDataSubmit',
  onChange: 'useDataChange',
}
export function maybeGetUseDataForValue(p) {
  if (DATA_VALUES.test(p.value)) {
    let [, value] = DATA_VALUES.exec(p.value)
    return PROP_TO_USE_DATA[value]
  } else {
    return null
  }
}

export function mergeBlockPropertiesAndScopes(block) {
  return [
    ...block.properties,
    ...block.scopes.flatMap((scope) => scope.properties),
  ].sort((a, b) => a.loc.start.line - b.loc.start.line)
}

export function getImportNameForSource(source, state) {
  let filePath = getFilePath(source)
  if (state.usedImports[filePath]) {
    // there is already a reference to the exact file
    return state.usedImports[filePath]
  }

  let importName = getImportName(
    toCamelCase(`from_${path.parse(filePath).name.replace(/[\W_]+/g, '')}`),
    state
  )

  state.usedImports[filePath] = importName
  state.use(`import * as ${importName} from '${filePath}'`)
  return importName
}

function getImportName(importName, state) {
  let result = importName
  if (state.usedImportNames[importName]) {
    result = `${importName}${state.usedImportNames[importName]}`
    state.usedImportNames[importName] += 1
  } else {
    state.usedImportNames[importName] = 1
  }
  return result
}

function getFilePath(source) {
  if (path.isAbsolute(source)) {
    return source.substring(1)
  }
  if (source.startsWith('.')) return source
  return `./${source}`
}

export function getVariableName(name, state) {
  let suffix = ''
  if (name in state.usedVariableNames) {
    suffix = `${state.usedVariableNames[name]++}`
  } else {
    state.usedVariableNames[name] = 1
  }
  return `${name}${suffix}`
}

export function transformToCamelCase(args) {
  return toCamelCase(
    args
      .filter(Boolean)
      .map((arg) => arg.replace(/\./g, '_'))
      .map(toSnakeCase)
      .join('_')
  )
}

export function getListItemKey(node) {
  let elements = getProp(node, 'itemKey')
    .value.split(',')
    .map((key) => key.trim())
  return `\`${elements
    .map((key) =>
      /[^A-Za-z_]/.test(key) ? `$\{item?.["${key}"]}` : `$\{item?.${key}}`
    )
    .join('-')}\``
}
