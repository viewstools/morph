import { getObjectAsString, getProp, hasKeysInChildren } from '../utils.js'
import hash from '../hash.js'

const asDynamicCss = style => {
  const props = Object.keys(style)
  let dynamicCss = ''

  props.forEach(prop => {
    // e.g. backgroundColor: `${props => props.isLoggedIn? "red" : "black"
    dynamicCss += `${prop}: \${props =>\ ${style[`${prop}`]}\}`
  })
  debugger
  return dynamicCss
}

// width: ${props => (props.isTwo ? 60 : props.isOne ? 30 : 20)}px;

const getStyledComponent = (name, base, style) =>
  `const ${name} = styled('${base}')\`${asDynamicCss(style)}\``

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

  debugger
  // TODO needs to be different, it should also be a classname here too
  if (hasKeysInChildren(node.style.dynamic)) {
    const block = node.parent
    debugger
    // TODO get block name or type
    // Animated.div
    // const code = getStyledComponent(node.dynamicStyleComponent.name, node.dynamicStyleComponent.tag, node.style.dynamic);
    const code = getStyledComponent(
      block.is,
      block.name.finalValue,
      node.style.dynamic.base
    )

    console.log(state.render)
    // TODO replace the tag for the one we need to
    state.stylesDynamic.push(code)
    // const dynamic = getObjectAsString(node.style.dynamic.base)
    // state.render.push(` style={${dynamic}}`)
  }
}
