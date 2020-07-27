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

    state.render.push(
      `{typeof props.children === 'function'? props.children({ isSelected: props.isSelected`
    )
    let useIsHovered = !!getActionableParent(node)
    if (useIsHovered) {
      state.useIsHovered = true
      state.render.push(', isHovered, isSelectedHovered')
    }
    state.render.push(`}) : null}`)

    return true
  }

  if (node.isFragment && node.name === 'View') {
    state.flow = getPropValueOrDefault(node, 'is', false)
    state.flowDefaultState = null
  }

  if (isStory(node, state)) {
    state.use('ViewsUseFlow')
  }

  let name = getBlockName(node, parent, state)
  if (name === null) return true

  state.use(name, node.isLazy)

  // TODO remove the use of those because they're just the name and keep one
  node.nameFinal = name
  node.nameTag = name

  if (handleTable(node, parent, state)) return true

  if (!node.isDefiningChildrenExplicitly) {
    state.render.push(`<${node.nameFinal}`)
  }

  if (parent && parent.childProps) {
    state.render.push('{...childProps}')
  }
}

export { leave }
