import {
  getActionableParent,
  getPropValueOrDefault,
  isStory,
} from '../utils.js'
import { leave } from '../react/block-name.js'
import handleTable from '../react/block-name-handle-table.js'
import getBlockName from './get-block-name.js'

export function enter(node, parent, state) {
  // if (parent && !parent.isBasic && !node.isBasic) return true
  if (node.isFragment && node.children.length === 0) return true
  if (node.isChildren) {
    state.hasAlreadyDefinedChildren = true

    let useIsHovered = !!getActionableParent(node)
    if (useIsHovered) {
      state.useIsHovered = true
    }

    state.render.push(
      `{props.children({ isSelected: props.isSelected${
        useIsHovered ? ', isHovered' : ''
      } })}`
    )
    return true
  }

  if (node.isFragment && node.name === 'View') {
    state.flow = getPropValueOrDefault(node, 'is', false)
    state.flowDefaultState = null
  }

  if (isStory(node, state)) {
    state.use('ViewsUseFlow')

    // if (state.flowDefaultState === null) {
    //   state.flowDefaultState = `${state.pathToStory}/${node.name}`
    // }
  }

  let name = getBlockName(node, parent, state)
  if (name === null) return true

  if (name === 'Animated.FlatList') {
    state.use('FlatList')
    name = 'AnimatedFlatList'
  }

  state.use(node.isBasic ? name.replace(/^Animated/, '') : name, node.isLazy)

  node.nameFinal = name

  if (handleTable(node, parent, state)) return true

  state.render.push(`<${name}`)
}

export { leave }
