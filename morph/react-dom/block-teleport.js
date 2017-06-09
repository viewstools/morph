import { getProp, isCode } from '../utils.js'
import safe from '../react/safe.js'

export const enter = (node, parent, state) => {
  if (node.teleport) {
    let to = getProp(node, 'teleportTo').value.value

    // if (to.startsWith('/')) {
    to = safe(to)
    // } else {
    //   to = isCode(to) ? `\${${to}}` : to
    //   to = `{\`\${context.router.route.match.url}/${to}\`}`
    //   state.usesRouterContext = true
    // }

    state.render.push(` to=${to}`)
  }
}
