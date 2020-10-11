import {
  getActionableParent,
  getPropValueOrDefault,
  hasProp,
  isView,
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
    state.render.push(`}) : props.children}`)

    return true
  }

  if (node.isFragment && node.name === 'View') {
    state.flow = getPropValueOrDefault(node, 'is', false)
    state.flowDefaultState = null
  }

  if (isView(node, state)) {
    state.use('ViewsUseFlow')
  }

  let name = getBlockName(node, parent, state)
  if (name === null) return true

  state.use(node.isBasic ? name.replace(/^Animated/, '') : name, node.isLazy)

  node.nameFinal = name

  if (handleTable(node, parent, state)) return true

  if (!node.isDefiningChildrenExplicitly) {
    state.render.push(`<${name}`)
  }

  if (
    /(Animated)?ScrollView/.test(name) &&
    hasProp(node, 'overflowX', (v) => v === 'auto' || v === 'scroll')
  ) {
    state.render.push(' horizontal')
  }

  if (parent && parent.childProps && !node.isBasic) {
    state.render.push(' {...childProps}')
  }
}

export { leave }
