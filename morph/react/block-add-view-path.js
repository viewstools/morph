import { isList } from '../utils.js'

export let enter = (node, parent, state) => {
  if (node.isFragment || isList(parent)) return

  if (state.viewPath) {
    state.render.push(` ${state.viewPathKey}="${state.viewPath}"`)
  } else {
    state.render.push(` ${state.viewPathKey}={props["${state.viewPathKey}"]}`)
  }
}
