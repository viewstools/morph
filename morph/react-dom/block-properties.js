import * as PropertiesChildrenProxyMap from '../react/properties-children-proxy-map.js'
import * as PropertiesClassName from './properties-class-name.js'
import * as PropertiesImage from './properties-image.js'
import * as PropertiesRoute from '../react/properties-route.js'
import * as PropertiesStyle from './properties-style.js'
import * as PropertyFormat from '../react/property-format.js'
import * as PropertyRef from '../react/property-ref.js'
import * as PropertyRest from '../react/property-rest.js'
import * as PropertyStyle from '../react/property-style.js'
import * as PropertyText from '../react/property-text.js'
import isValidPropertyForBlock from './is-valid-property-for-block.js'

export function enter(node, parent, state) {
  PropertiesStyle.enter(node, parent, state)
  PropertiesClassName.enter(node, parent, state)
  PropertiesImage.enter(node, parent, state)
  PropertyFormat.enter(node, parent, state)

  node.properties.forEach(propNode => {
    if (
      propNode.name === 'at' ||
      propNode.name === 'when' ||
      propNode.name === 'onWhen' ||
      (propNode.name === 'ref' && state.debug) ||
      propNode.tags.unsupportedShorthand ||
      (!isValidPropertyForBlock(propNode, node, state) && node.isBasic) ||
      (propNode.name === 'from' && node.name === 'List')
    )
      return

    !PropertyRef.enter(propNode, node, state) &&
      !PropertyStyle.enter(propNode, node, state) &&
      !PropertyText.enter(propNode, node, state) &&
      PropertyRest.enter(propNode, node, state)
  })

  PropertiesStyle.leave(node, parent, state)
  PropertiesRoute.leave(node, parent, state)
  PropertiesChildrenProxyMap.leave(node, parent, state)
  PropertiesClassName.leave(node, parent, state)
}
