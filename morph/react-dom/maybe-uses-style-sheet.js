import { hasKeys } from '../utils.js'

// TODO don't import glam if styles aren't inlined and there are no dynamic
// styles
export default state => {
  if (hasKeys(state.styles) && state.inlineStyles) {
    state.uses.push('glam')
  }
}
