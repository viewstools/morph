import { checkParentStem } from '../utils.js'
import { leave } from '../react/block-name.js'
import getBlockName from './get-block-name.js'

export function enter(node, parent, state) {
  let name = getBlockName(node, parent, state)
  if (name === null) return true

  node.nameFinal = name
  node.nameTag = name
  state.use(name)

  if (node.properties && node.isBasic) {
    const hasDynamicStyles = node.properties.some(
      item => item.tags.style && item.tags.code
    )

    const hasScopedStyles = Object.keys(node.scoped).some(key =>
      node.properties.some(prop => prop.name === key && prop.tags.style)
    )

    const hasHoverStem = node.properties.some(prop => prop.tags.hover)
    const hasMatchingParentWithHover =
      hasHoverStem && checkParentStem(node, 'hover')

    node.isDynamic =
      hasDynamicStyles || hasScopedStyles || hasMatchingParentWithHover

    if (node.isDynamic) {
      // we need to reset it to the block's name or value
      let finalValue = node.is || node.name

      // count repeatead ones
      if (state.usedBlockNames[finalValue]) {
        finalValue = `${finalValue}${state.usedBlockNames[finalValue]++}`
      } else {
        state.usedBlockNames[finalValue] = 1
      }

      node.nameFinal = finalValue
    }
  }

  state.render.push(`<${node.nameFinal}`)
}

export { leave }
