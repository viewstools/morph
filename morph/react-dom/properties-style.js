import { getObjectAsString, getProp, hasKeysInChildren } from '../utils.js'
import hash from '../hash.js'
import toSlugCase from 'to-slug-case'

const asDynamicCss = style => {
  const props = Object.keys(style)
  let dynamicCss = ''

  props.forEach(prop => {
    dynamicCss += `${toSlugCase(prop)}: \${props =>\ ${style[`${prop}`]}\}`
  })
  return dynamicCss
}

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

  // TODO needs to be different, it should also be a classname here too
  if (hasKeysInChildren(node.style.dynamic)) {
    const block = node.parent
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
    state.render[0] = `<${block.is}`
    state.stylesDynamic.push(code)
    block.name.finalValue = block.is
    // const dynamic = getObjectAsString(node.style.dynamic.base);
    // state.render.push(` style={${dynamic}}`);
  }
}
