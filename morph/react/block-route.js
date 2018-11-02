import { getProp, isSlot } from '../utils.js'
import safe from './safe.js'

export function enter(node, parent, state) {
  const at = getProp(node, 'at')
  if (at) {
    node.isRoute = true

    let [path, isExact = false] = at.value.split(' ')

    at.routePath = path

    if (path === '/') state.use('Router')

    if (state.isReactNative) {
      state.use('Route')

      if (!path.startsWith('/')) {
        path = isSlot(path) ? `\`\${${path}}\`` : path
        // path = `\`\${props.match.url}/${to}\``
      }

      state.render.push(
        `<Route path=${safe(path)} ${
          isExact ? 'exact' : ''
        } render={routeProps => `
      )
    }
  }
}

export function leave(node, parent, state) {
  if (node.isRoute && state.isReactNative) {
    state.render.push('} />')
  }
}
