import { checkParentStem, hasKeysInChildren } from '../utils.js'
import hash from '../hash.js'
import toSlugCase from 'to-slug-case'

const asDynamicCss = (style, styleKey, parentEl) => {
  const props = Object.keys(style)
  let css = []

  if (parentEl) {
    css.push(`\${${parentEl}}:${styleKey} &, \${${parentEl}}.${styleKey} & {`)
  } else if (
    styleKey === 'hover' ||
    styleKey === 'disabled' ||
    styleKey === 'focus'
  ) {
    css.push(`&:${styleKey}, &.${styleKey} {`)
  }

  css = css.concat(
    props.map(prop => `${toSlugCase(prop)}: \${props => ${style[prop]}};`)
  )

  if (styleKey !== 'base') css.push(`}`)

  return css
}

export const leave = (node, parent, state) => {
  if (hasKeysInChildren(node.style.static)) {
    const id = hash(node.style.static)
    state.styles[id] = node.style.static
    parent.styleId = id
    node.className.push(`\${styles.${id}}`)
  }

  if (hasKeysInChildren(node.style.dynamic)) {
    const filteredDynamicStyles = Object.keys(node.style.dynamic).filter(
      (dynamicKey, index) => hasKeysInChildren(node.style.dynamic[dynamicKey])
    )

    // TODO revisit
    const css = filteredDynamicStyles
      .map((styleKey, index) => {
        const parentEl = node.parent.parent
          ? checkParentStem(node.parent.parent, styleKey)
          : null
        // TODO do something with it
        return asDynamicCss(
          node.style.dynamic[styleKey],
          styleKey,
          parentEl
        ).join('\n')
      })
      .join('\n')

    state.stylesDynamic.push(
      `const ${node.parent.name.finalValue} = styled('${
        node.parent.name.tagValue
      }')\`${css}\``
    )
  }
}
