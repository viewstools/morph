import { leave } from '../react/block-name.js'
import getBlockName from './get-block-name.js'

export function enter(node, parent, state) {
  let name = getBlockName(node, parent, state)
  if (name === null) return true

  // TODO remove the use of those because they're just the name
  // and keep one
  debugger
  node.nameFinal = name
  node.nameTag = name
  state.use(name)

  // if (node.isBasic) {
  //   const hasAnimatedStyles = node.properties.some(
  //     prop => prop.tags.style && prop.animation && prop.animation.curve === 'spring'
  //   )

  //   const hasAnimatedScopedStyles = node.scopes
  //     .filter(scope => !scope.isLocal)
  //     .some(
  //       scope =>scope.properties.some( prop => prop.tags.style && prop.animation && prop.animation.curve === 'spring')
  //         // scope.isSystem
  //         //   ? scope.properties.some(prop => prop.tags.style && prop.tags.slot)
  //         //   : scope.properties.some(prop => prop.tags.style)
  //     )

  //   // TODO expand to active, focus, etc
  //   // const hasHoverStem = node.scopes.some(scope => scope.value === 'hover')
  //   // const hasMatchingParentWithHover =
  //   //   hasHoverStem && checkParentStem(node, 'hover')

  //   node.isAnimated = hasAnimatedStyles || hasAnimatedScopedStyles

  //   // node.isDynamic =
  //   //   hasDynamicStyles || hasDynamicScopedStyles || hasMatchingParentWithHover

  //   if (node.isDynamic) {
  //     // we need to reset it to the block's name or value
  //     let finalValue = node.is || node.name

  //     // count repeatead ones
  //     if (state.usedBlockNames[finalValue]) {
  //       finalValue = `${finalValue}${state.usedBlockNames[finalValue]++}`
  //     } else {
  //       state.usedBlockNames[finalValue] = 1
  //     }

  //     node.nameFinal = finalValue
  //   }
  // }

  state.render.push(`<${node.nameFinal}`)
}

export { leave }
