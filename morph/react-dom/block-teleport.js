import { getProp, isCode } from '../utils.js'
import safe from '../react/safe.js'

export const enter = (node, parent, state) => {
  if (node.teleport) {
    let to = getProp(node, 'teleportTo').value.value

    if (to.startsWith('/') || to === '..') {
      to = safe(to)
    } else {
      to = isCode(to) ? `\${${to}}` : to
      to = `{\`\${props.match.url === '/' ? '' : props.match.url}/${to}\`}`
      state.withRouter = true
    }

    state.render.push(` to=${to}`)
  }
}
