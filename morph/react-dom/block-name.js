import { checkParentStem, getStyleType } from '../utils.js'
import getBlockName from './get-block-name.js'

export function enter(node, parent, state) {
  let name = getBlockName(node, parent, state)
  if (name === null) return this.skip()

  if (node.properties) {
    const dynamicStyles = node.properties.list.filter(
      item => item.tags.style && item.value.value.match(/props./)
    )
    const hasHoverStem = node.properties.list.filter(
      item => getStyleType(item) === 'hover'
    )
    const hasMatchingParent = parent ? checkParentStem(parent, 'hover') : false

    node.isDynamic =
      dynamicStyles.length > 0 || (hasMatchingParent && hasHoverStem)

    if (node.isDynamic) {
      node.name.tagValue = name

      name = node.is || node.name.value

      if (state.usedBlockNames[name]) {
        name = `${name}${state.usedBlockNames[name]++}`
      } else {
        state.usedBlockNames[name] = 1
      }
    }
  }

  node.name.finalValue = name
  state.render.push(`<${name}`)
}
