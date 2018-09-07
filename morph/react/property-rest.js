import { getLocalsString, hasLocals } from '../utils.js'

export function enter(node, parent, state) {
  const value = state.getValueForProperty(node, parent, state)

  if (value) {
    Object.keys(value).forEach(k => {
      if ((k === 'text' || k === 'placeholder') && hasLocals(node, parent)) {
        return state.render.push(
          ` ${k}=${getLocalsString(node, parent, state)}`
        )
      }
      debugger
      return state.render.push(` ${k}=${value[k]}`)
    })
  }
}
