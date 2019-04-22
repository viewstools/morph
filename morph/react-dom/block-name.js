import { getProp, getPropValueOrDefault, hasProp } from '../utils.js'
import { leave } from '../react/block-name.js'
import handleTable from '../react/block-name-handle-table.js'
import getBlockName from './get-block-name.js'

export function enter(node, parent, state) {
  if (parent && !parent.isBasic && !node.isBasic) return true
  if (node.isFragment && node.children.length === 0) {
    // if (node.name === 'View') {
    //   let name = getPropValueOrDefault(node, 'name', state.name)
    //   if (hasProp(node, 'actions')) {
    //     let actions = getProp(node, 'actions').value.split(',')
    //     if (actions.length > 1) {
    //       state.render.push('<React.Fragment>')
    //       state.use('React.Fragment')
    //       state.render.push(name)
    //     }

    //     actions.forEach(raction => {
    //       let action = raction.trim()
    //       let parts = action.split('/')
    //       let key = parts[parts.length - 2]
    //       let value = parts[parts.length - 1]

    //       state.render.push(
    //         `<button onClick={() => setState("${key}", "${value}")}>${key} -> ${value}</button>`
    //       )
    //       state.use('ViewsUseFlow')
    //       state.flowSetState = true
    //     })

    //     if (actions.length > 1) {
    //       state.render.push('</React.Fragment>')
    //     }
    //   } else {
    //     state.render.push(`"${name}"`)
    //   }
    // }

    return true
  }

  if (node.isFragment && node.name === 'View') {
    state.flow = getPropValueOrDefault(node, 'flow', false)
    state.flowDefaultState = null
  }

  if (!node.isBasic && state.flow === 'separate') {
    state.use('ViewsUseFlow')

    if (state.flowDefaultState === null) {
      state.flowDefaultState = node.name
    }
  }

  let name = getBlockName(node, parent, state)
  if (name === null) return true

  state.use(name, node.isLazy)

  if (node.isProxy) {
    name = `props.proxy${name}`
  }

  // TODO remove the use of those because they're just the name and keep one
  node.nameFinal = name
  node.nameTag = name

  if (handleTable(node, parent, state)) return true

  state.render.push(`<${node.nameFinal}`)
}

export { leave }
