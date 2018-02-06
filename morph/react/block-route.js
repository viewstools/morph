import { getProp, isSlot } from '../utils.js'
import safe from './safe.js'

export function enter(node, parent, state) {
  const at = getProp(node, 'at')
  if (at) {
    let [path, isExact = false] = at.value.split(' ')
    state.use('Route')

    if (path === '/') state.use('Router')

    if (!path.startsWith('/')) {
      path = isSlot(path) ? `\`\${${path}}\`` : path
      // path = `\`\${props.match.url}/${to}\``
    }

    node.isRoute = true
    state.render.push(
      `<Route path=${safe(path)} ${
        isExact ? 'exact' : ''
      } render={routeProps => `
    )
  }
}

export function leave(node, parent, state) {
  if (node.isRoute) {
    state.render.push('} />')
  }
}
