import { getLocalsString, hasLocals } from '../utils.js'

export function enter(node, parent, state) {
  let value = state.getValueForProperty(node, parent, state)

  if (value) {
    Object.keys(value).forEach(k => {
      if ((k === 'text' || k === 'placeholder') && hasLocals(node, parent)) {
        return state.render.push(
          ` ${k}=${getLocalsString(node, parent, state)}`
        )
      } else if (k === '...') {
        return state.render.push(` {...${value[k]}}`)
      } else {
        return state.render.push(` ${k}=${value[k]}`)
      }
    })
  }
}
