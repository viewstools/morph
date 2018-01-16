import { getPropertiesAsObject } from '../utils.js'

export function enter(node, parent, state) {
  if (node.name !== 'Proxy') return

  let prevParent = parent
  while (prevParent) {
    if (prevParent.type === 'Block' && !prevParent.parent) {
      prevParent.usesProxy = true
    }
    prevParent = prevParent.parent
  }

  let proxied = node.properties.find(p => p.name === 'from')
  if (!proxied) return
  proxied = proxied.value

  const otherProperties = node.properties.filter(
    p => p.name !== 'from' && p.name !== 'onWhen' && p.name !== 'when'
  )

  if (!node.onWhen) {
    state.render.push('{')
  }

  if (proxied === 'all') {
    const childContent =
      otherProperties.length > 0
        ? `React.Children.map(props.children, child => React.cloneElement(child, ${getPropertiesAsObject(
            otherProperties
          )}))`
        : 'props.children'

    state.render.push(childContent)
  } else {
    if (!node.onWhen) {
      state.render.push('props.childrenProxyMap && ')
    }
    const child = `childrenArray[props.childrenProxyMap['${proxied}']]`

    if (otherProperties.length > 0) {
      if (node.onWhen) {
        if (state.render[state.render.length - 1].endsWith(' ? ')) {
          state.render[state.render.length - 1] = state.render[
            state.render.length - 1
          ].replace(' ? ', ' && ')
        }
      }

      state.render.push(
        ` ${child} ? React.cloneElement(${child}, ${getPropertiesAsObject(
          otherProperties
        )}) : null`
      )
    } else {
      state.render.push(child)
    }

    state.usesChildrenArray = true
  }

  state.render.push('}')

  // skip next
  return true
}
