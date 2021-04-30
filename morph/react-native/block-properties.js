import * as PropertiesStyle from './properties-style.js'
import * as PropertyFormat from '../react/property-format.js'
import * as PropertyRef from '../react/property-ref.js'
import * as PropertyRest from '../react/property-rest.js'
import * as PropertyStyle from '../react/property-style.js'
import * as PropertyText from '../react/property-text.js'
import * as PropertyViewPath from '../react/property-view-path.js'
import * as PropertyEventHandler from '../react/property-event-handler.js'
import { isColumn } from '../utils.js'
import isValidPropertyForBlock from './is-valid-property-for-block.js'

export function enter(node, parent, state) {
  if (node.isFragment) return false

  PropertiesStyle.enter(node, parent, state)
  PropertyFormat.enter(node, parent, state)
  PropertyViewPath.enter(node, parent, state)

  node.properties.forEach((propNode) => {
    if (
      propNode.name === 'lazy' ||
      propNode.name === 'at' ||
      propNode.name === 'when' ||
      propNode.name === 'onWhen' ||
      propNode.tags.unsupportedShorthand ||
      (!isValidPropertyForBlock(propNode, node, state) && node.isBasic) ||
      ((propNode.name === 'from' || propNode.name === 'itemDataContextName') &&
        (node.name === 'List' || node.name === 'Table')) ||
      (propNode.name === 'key' && parent.isList) ||
      (propNode.name === 'pass' && node.isList) ||
      (propNode.name === 'opacity' && state.isSvg) ||
      (propNode.name === 'width' && isColumn(node))
    )
      return

    PropertyEventHandler.enter(propNode, node, state)

    !PropertyRef.enter(propNode, node, state) &&
      !PropertyStyle.enter(propNode, node, state) &&
      !PropertyText.enter(propNode, node, state) &&
      PropertyRest.enter(propNode, node, state)
  })

  PropertiesStyle.leave(node, parent, state)
}
