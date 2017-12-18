import {
  checkParentStem,
  getObjectAsString,
  getProp,
  hasKeysInChildren,
  isUnitlessProp,
} from '../utils.js'
import hash from '../hash.js'
import toSlugCase from 'to-slug-case'

let dynamicCss

const asDynamicCss = (style, styleKey, parentEl) => {
  const props = Object.keys(style)

  if (parentEl) {
    dynamicCss += `\${${parentEl}}\:${styleKey} &, \${${parentEl}}\.${styleKey} & {`
  } else if (styleKey == 'hover') {
    dynamicCss += `&:${styleKey}, &.${styleKey} {`
  }

  props.forEach(prop => {
    const shouldApplyUnits =
      !isUnitlessProp(prop) &&
      Number.isInteger(parseInt(style[prop].split(': ').slice(-1)[0]))
    const needsQuotes = /props|item/.test(`${style[`${prop}`]}`) ? false : true
    dynamicCss += needsQuotes
      ? `${toSlugCase(prop)}: \${props =>\ '${style[
          `${prop}`
        ]}'\}${shouldApplyUnits ? 'px' : ''};`
      : `${toSlugCase(prop)}: \${props =>\ ${style[
          `${prop}`
        ]}\}${shouldApplyUnits ? 'px' : ''};`
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

  if (hasKeysInChildren(node.style.dynamic)) {
    const block = node.parent
    let blockName = block.is || block.name.value
    let parentEl

    const alreadyExists = state.render.filter(item =>
      item.match(`<${blockName}`)
    )
    blockName =
      alreadyExists.length > 0
        ? `${blockName}${alreadyExists.length}`
        : blockName

    let code = ''
    dynamicCss = ''
    const filteredDynamicStyles = Object.keys(
      node.style.dynamic
    ).filter((dynamicKey, index) => {
      return hasKeysInChildren(node.style.dynamic[dynamicKey])
    })

    const filteredLength = filteredDynamicStyles.length
    filteredDynamicStyles.forEach((styleKey, index) => {
      parentEl = node.parent.parent
        ? checkParentStem(node.parent.parent, styleKey)
        : null
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

    const renderValue = state.render.filter(item =>
      item.includes(`${block.name.finalValue} isDynamic`)
    )[0]
    state.render[state.render.indexOf(renderValue)] = `<${blockName}`

    state.stylesDynamic.push(code)
    block.name.finalValue = blockName
  }
}
