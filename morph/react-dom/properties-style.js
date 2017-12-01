import { getObjectAsString, getProp, hasKeysInChildren } from '../utils.js'
import hash from '../hash.js'

const asDynamicCss = style => {
  // ....
  return `padding: \${props => props.whateever? 10: 0}px`
}

const getStyledComponent = (name, base, style) => `
const ${name} = styled(${base})\`${asDynamicCss(style)}\`
`

export const leave = (node, parent, state) => {
  if (hasKeysInChildren(node.style.static)) {
    const id = hash(node.style.static)
    state.styles[id] = node.style.static
    parent.styleId = id
    const isActive = getProp(parent, 'isActive')

    node.className.push(`\${styles.${id}}`)

    if (isActive) {
      node.className.push(`\${${isActive.value.value} && 'active'}`)
    }
  }

  // TODO needs to be different, it should also be a classname here too
  if (hasKeysInChildren(node.style.dynamic)) {
    // TODO get block name or type
    // Animated.div
    const code = getStyledComponent(
      node.dynamicStyleComponent.name,
      node.dynamicStyleComponent.tag,
      node.style.dynamic
    )
    console.log(state.render)
    // TODO replace the tag for the one we need to
    state.stylesDynamic.push(code)
    // const dynamic = getObjectAsString(node.style.dynamic.base)
    // state.render.push(` style={${dynamic}}`)
  }
}
