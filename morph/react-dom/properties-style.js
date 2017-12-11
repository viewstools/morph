import { getObjectAsString, getProp, hasKeysInChildren } from '../utils.js'
import hash from '../hash.js'
import toSlugCase from 'to-slug-case'

let dynamicCss

const asDynamicCss = (style, styleKey, parentEl) => {
  const props = Object.keys(style)

  debugger
  if (styleKey !== 'base' && parentEl) {
    dynamicCss += `\${${parentEl}}\:${styleKey} & {`
  } else if (styleKey !== 'base') {
    dynamicCss += `&:${styleKey} {`
  }
  // ${ButtonOne}:hover & {

  props.forEach(prop => {
    dynamicCss += `${toSlugCase(prop)}: \${props =>\ ${style[`${prop}`]}\};`
  })

  if (styleKey !== 'base') dynamicCss += `}`

  return dynamicCss
}

const getStyledComponent = (name, base, style, styleKey, parentEl) =>
  `const ${name} = styled('${base}')\`${asDynamicCss(
    style,
    styleKey,
    parentEl
  )}\``

const checkParentStem = (node, styleKey) => {
  debugger
  if (styleKey === 'base' || !node.parent.parent) return

  //const nodeStyleStem = getStyleType(node);

  //if (nodeStyleStem !== 'base' && node.parent.parent) {
  const matchedParentEl = node.parent.parent.parent
  const matchingParentStem = matchedParentEl.properties.list.find(
    prop => prop.key.valueRaw.toLowerCase().indexOf(styleKey) > -1
  )
  //}

  if (matchingParentStem) {
    return matchedParentEl.is || matchedParentEl.name.value
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

    debugger

    const filteredLength = filteredDynamicStyles.length
    filteredDynamicStyles.forEach((styleKey, index) => {
      debugger
      const parentEl = checkParentStem(node, styleKey)
      if (filteredLength - 1 !== index) {
        asDynamicCss(node.style.dynamic[styleKey], styleKey, parentEl)
      } else {
        code = getStyledComponent(
          blockName,
          block.name.finalValue,
          node.style.dynamic[styleKey],
          styleKey,
          parentEl
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
