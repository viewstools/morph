import { getObjectAsString, getProp, hasKeysInChildren } from '../utils.js'
import hash from '../hash.js'
import wrap from '../react/wrap.js'

export const leave = (node, parent, state) => {
  if (hasKeysInChildren(node.style.static)) {
    const id = hash(node.style.static)
    state.styles[id] = node.style.static
    parent.styleId = id
    const isActive = getProp(parent, 'isActive')

    let className = `styles.${id}`

    if (isActive) {
      const active = `${isActive.value.value} && 'active'`
      className = `\`\${${className}} \${${active}}\``
    }

    state.render.push(` className=${wrap(className)}`)
  }
  // TODO needs to be different, it should also be a classname here too
  if (hasKeysInChildren(node.style.dynamic)) {
    const dynamic = getObjectAsString(node.style.dynamic.base)
    state.render.push(` style={${dynamic}}`)
  }
}
