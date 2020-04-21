import * as PropertiesClassName from './properties-class-name.js'
import * as PropertiesImage from './properties-image.js'
import * as PropertiesStyle from './properties-style.js'
import * as PropertyFormat from '../react/property-format.js'
import * as PropertyOnClickUserSelect from './property-onclick-user-select.js'
import * as PropertyRef from '../react/property-ref.js'
import * as PropertyRest from '../react/property-rest.js'
import * as PropertyStyle from '../react/property-style.js'
import * as PropertyText from '../react/property-text.js'
import * as PropertyPathToView from '../react/property-path-to-view.js'
import { isColumn } from '../utils.js'
import isValidPropertyForBlock from './is-valid-property-for-block.js'

export function enter(node, parent, state) {
  if (node.isFragment) return false

  PropertiesStyle.enter(node, parent, state)
  PropertiesClassName.enter(node, parent, state)
  PropertiesImage.enter(node, parent, state)
  PropertyFormat.enter(node, parent, state)
  PropertyPathToView.enter(node, parent, state)

  node.properties.forEach(propNode => {
    if (
      propNode.name === 'lazy' ||
      propNode.name === 'at' ||
      propNode.name === 'when' ||
      propNode.name === 'onWhen' ||
      propNode.tags.unsupportedShorthand ||
      (!isValidPropertyForBlock(propNode, node, state) && node.isBasic) ||
      (propNode.name === 'from' &&
        (node.name === 'List' || node.name === 'Table')) ||
      (propNode.name === 'key' && parent.isList) ||
      (propNode.name === 'pass' && node.isList) ||
      (propNode.name === 'width' && isColumn(node))
    )
      return

    !PropertyRef.enter(propNode, node, state) &&
      !PropertyStyle.enter(propNode, node, state) &&
      !PropertyText.enter(propNode, node, state) &&
      PropertyRest.enter(propNode, node, state)
  })
  PropertyOnClickUserSelect.enter(node, parent, state)

  PropertiesStyle.leave(node, parent, state)
  PropertiesClassName.leave(node, parent, state)
}
