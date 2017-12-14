import { getProp, hasProp } from '../utils.js'
import toCamelCase from 'to-camel-case'

export default (node, parent, state) => {
  let name
  switch (node.name.value) {
    case 'CaptureEmail':
    case 'CaptureFile':
    case 'CaptureNumber':
    case 'CapturePhone':
    case 'CaptureSecure':
    case 'CaptureText':
      name = 'input'
      break

    case 'CaptureTextArea':
      name = 'textarea'
      break

    case 'Horizontal':
    case 'Vertical':
      name = getGroupBlockName(node, parent, state)
      break

    case 'Image':
      name = 'img'
      break

    case 'Text':
      return 'span'

    case 'List':
      name = 'div'
      break

    case 'Proxy':
      return null

    case 'Svg':
      name = 'svg'
      break

    case 'SvgGroup':
      name = 'g'
      break

    case 'SvgCircle':
    case 'SvgEllipse':
    case 'SvgLinearGradient':
    case 'SvgRadialGradient':
    case 'SvgLine':
    case 'SvgText':
    case 'SvgPath':
    case 'SvgPolygon':
    case 'SvgPolyline':
    case 'SvgRect':
    case 'SvgSymbol':
    case 'SvgUse':
    case 'SvgDefs':
    case 'SvgStop':
      name = toCamelCase(node.name.value.replace('Svg', ''))
      break

    default:
      name = node.name.value
      break
  }

  if (node.maybeAnimated && !node.isRoute) {
    if (state.enableAnimated && name !== 'Link' && name !== 'form') {
      name = `Animated.${name}`
    }

    node.dynamicStyleComponent = {
      tag: /Animated/.test(name) ? name : `"${name}"`,
    }
    name = `${state.name}${node.name.value}`

    if (state.stylesDynamicNames.includes(name)) {
      name = `${name}${state.stylesDynamicNames.length}`
    }
    state.stylesDynamicNames.push(name)
    node.dynamicStyleComponent.name = name

    node.properties.dynamicStyleComponent = node.dynamicStyleComponent
  }
  return name
}

const getGroupBlockName = (node, parent, state) => {
  let name = 'div'

  if (hasProp(node, 'teleportTo')) {
    name = 'Link'
    node.teleport = true
  } else if (hasProp(node, 'goTo')) {
    name = 'a'
    node.goTo = true
  } else if (hasProp(node, 'onClick')) {
    const propNode = getProp(node, 'onClick')
    let prevParent = parent
    let canBeButton = true

    while (prevParent && canBeButton) {
      if (prevParent.type === 'Block') {
        canBeButton = !hasProp(prevParent, 'onClick')
      }
      prevParent = prevParent.parent
    }

    if (canBeButton) {
      name = 'button'
      node.action = propNode.value.value
    }
  } else if (hasProp(node, 'overflowY', v => v === 'auto' || v === 'scroll')) {
    name = 'div'
  } else if (hasProp(node, 'onSubmit')) {
    name = 'form'
  }

  return name
}
