import { getPropValueOrDefault, isStory } from '../utils.js'
import { leave } from '../react/block-name.js'
import handleTable from '../react/block-name-handle-table.js'
import getBlockName from './get-block-name.js'

export function enter(node, parent, state) {
  // if (parent && !parent.isBasic && !node.isBasic) return true
  if (node.isFragment && node.children.length === 0) return true
  if (node.isChildren) {
    state.hasAlreadyDefinedChildren = true
    state.render.push('{props.children}')
    return true
  }

  if (node.isFragment && node.name === 'View') {
    state.flow = getPropValueOrDefault(node, 'flow', false)
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

  state.use(name, node.isLazy)

  // TODO remove the use of those because they're just the name and keep one
  node.nameFinal = name
  node.nameTag = name

  if (handleTable(node, parent, state)) return true

  if (!node.isDefiningChildrenExplicitly) {
    state.render.push(`<${node.nameFinal}`)
  }
}

export { leave }
