import { getObjectAsString, getProp, hasKeysInChildren } from '../utils.js'
import hash from '../hash.js'
import toSlugCase from 'to-slug-case'

let dynamicCss

const asDynamicCss = (style, styleKey) => {
  const props = Object.keys(style)

  if (styleKey !== 'base') dynamicCss += `&:${styleKey} {`

  props.forEach(prop => {
    dynamicCss += `${toSlugCase(prop)}: \${props =>\ ${style[`${prop}`]}\};`
  })

  if (styleKey !== 'base') dynamicCss += `}`

  return dynamicCss
}

const getStyledComponent = (name, base, style, styleKey) =>
  `const ${name} = styled('${base}')\`${asDynamicCss(style, styleKey)}\``

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
    const blockName = block.is || block.name.value
    let code = ''
    dynamicCss = ''
    // TODO get block name or type
    // Animated.div
    const filteredDynamicStyles = Object.keys(
      node.style.dynamic
    ).filter((dynamicKey, index) => {
      return hasKeysInChildren(node.style.dynamic[dynamicKey])
    })

    const filteredLength = filteredDynamicStyles.length
    filteredDynamicStyles.forEach((styleKey, index) => {
      if (filteredLength - 1 !== index) {
        asDynamicCss(node.style.dynamic[styleKey], styleKey)
      } else {
        code = getStyledComponent(
          blockName,
          block.name.finalValue,
          node.style.dynamic[styleKey],
          styleKey
        )
      }
    })

    console.log(state.render)

    const renderValue = state.render.filter(item =>
      item.includes(block.name.finalValue)
    )[0]
    state.render[state.render.indexOf(renderValue)] = `<${blockName}`

    state.stylesDynamic.push(code)
    block.name.finalValue = blockName
  }
}
