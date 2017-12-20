import { checkParentStem } from '../utils.js'
import getBlockName from './get-block-name.js'

export function enter(node, parent, state) {
  let name = getBlockName(node, parent, state)
  if (name === null) return this.skip()

  node.name.finalValue = name
  node.name.tagValue = name
  state.use(name)

  if (node.properties) {
    const hasDynamicStyles = node.properties.list.some(
      item => item.tags.style && item.tags.code
    )

    const hasScopedStyles = Object.keys(node.scoped).some(key =>
      node.properties.list.some(
        item => item.key.value === key && item.tags.style
      )
    )

    const hasHoverStem = node.properties.list.some(item => item.tags.hover)
    const hasMatchingParentWithHover =
      hasHoverStem && parent && checkParentStem(parent, 'hover')

    node.isDynamic =
      hasDynamicStyles || hasScopedStyles || hasMatchingParentWithHover

    if (node.isDynamic) {
      // we need to reset it to the block's name or value
      let finalValue = node.is || node.name.value

      // count repeatead ones
      if (state.usedBlockNames[finalValue]) {
        finalValue = `${finalValue}${state.usedBlockNames[finalValue]++}`
      } else {
        state.usedBlockNames[finalValue] = 1
      }

      node.name.finalValue = finalValue
    }
  }

  state.render.push(`<${node.name.finalValue}`)
}
