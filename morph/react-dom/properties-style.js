import { getObjectAsString, getProp, hasKeysInChildren } from '../utils.js'
import hash from '../hash.js'
import toSlugCase from 'to-slug-case'

let dynamicCss = ''

const asDynamicCss = (style, styleKey) => {
  const props = Object.keys(style)

  debugger
  if (styleKey !== 'base') dynamicCss += `&:${styleKey} {`

  props.forEach(prop => {
    dynamicCss += `${toSlugCase(prop)}: \${props =>\ ${style[`${prop}`]}\}`
  })

  if (styleKey !== 'base') dynamicCss += `}`

  debugger
  return dynamicCss
}

const getStyledComponent = (name, base, style, styleKey, isLastItem) => {
  if (!isLastItem) {
    asDynamicCss(style, styleKey)
  } else {
    console.log(
      'wtffff',
      `const ${name} = styled('${base}')\`${asDynamicCss(style, styleKey)}\``
    )
    debugger

    return `const ${name} = styled('${base}')\`${asDynamicCss(
      style,
      styleKey
    )}\``
  }
}

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
    let code = ''
    const filteredDynamicStyles = Object.keys(
      node.style.dynamic
    ).filter((dynamicKey, index) => {
      console.log(
        'dynamicProp',
        hasKeysInChildren(node.style.dynamic[dynamicKey])
      )
      return hasKeysInChildren(node.style.dynamic[dynamicKey])
      // code += getStyledComponent(block.is, block.name.finalValue, node.style.dynamic[dynamicKey], dynamicKey);
    })
    console.log('filteredDynamicStyles', filteredDynamicStyles)
    debugger

    const filteredLength = filteredDynamicStyles.length
    code += filteredDynamicStyles.forEach((styleKey, index) => {
      return getStyledComponent(
        block.is,
        block.name.finalValue,
        node.style.dynamic[styleKey],
        styleKey,
        filteredLength - 1 === index
      )
    })
    // const code = getStyledComponent(node.dynamicStyleComponent.name, node.dynamicStyleComponent.tag, node.style.dynamic);
    // const code = getStyledComponent(block.is, block.name.finalValue, node.style.dynamic.base);

    console.log(state.render)
    // TODO replace the tag for the one we need to
    state.render[0] = `<${block.is}`
    state.stylesDynamic.push(code)
    block.name.finalValue = block.is

    // const dynamic = getObjectAsString(node.style.dynamic.base);
    // state.render.push(` style={${dynamic}}`);
  }
}
