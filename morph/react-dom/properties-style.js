import {
  getActionableParent,
  getAllowedStyleKeys,
  hasKeysInChildren,
} from '../utils.js'
import hash from '../hash.js'
import toSlugCase from 'to-slug-case'

// TODO UNITS

const asDynamicCss = styles =>
  Object.keys(styles).map(
    prop => `${toSlugCase(prop)}: \${props => ${styles[prop]}};`
  )

const asStaticCss = styles =>
  Object.keys(styles).map(prop => `${toSlugCase(prop)}: ${styles[prop]};`)

const asCss = (styles, key, scopedUnderParent) => {
  let css = []

  if (key !== 'base') {
    if (scopedUnderParent) {
      let parent = `\${${scopedUnderParent}}`
      if (/_/.test(scopedUnderParent)) {
        parent = `.${parent}`
      }
      css.push(`${parent}:${key} &, ${parent}.${key} & {`)
    } else if (key === 'hover' || key === 'disabled' || key === 'focus') {
      css.push(`&:${key}, &.${key} {`)
    }
  }

  css = css.concat(styles)

  if (key !== 'base') css.push(`}`)

  return css
}

export const leave = (node, parent, state) => {
  const { dynamic, static: staticStyle } = node.style

  const allowedStyleKeys = getAllowedStyleKeys(parent)
  let scopedUnderParent =
    !parent.isCapture && !parent.action && getActionableParent(parent)
  if (scopedUnderParent) {
    scopedUnderParent = scopedUnderParent.styleName
  }

  // dynamic merges static styles
  if (hasKeysInChildren(dynamic)) {
    state.cssDynamic = true
    parent.styleName = parent.name.finalValue

    const css = Object.keys(dynamic)
      .filter(
        key => allowedStyleKeys.includes(key) && hasKeysInChildren(dynamic[key])
      )
      .map(key =>
        asCss(
          [...asDynamicCss(dynamic[key]), ...asStaticCss(staticStyle[key])],
          key,
          scopedUnderParent
        ).join('\n')
      )
      .join('\n')

    state.styles.push(
      `const ${node.parent.name.finalValue} = styled('${
        node.parent.name.tagValue
      }')\`${css}\``
    )
  } else if (hasKeysInChildren(staticStyle)) {
    state.cssStatic = true

    const id = `${parent.is || parent.name.value}_${hash(staticStyle)}`
    parent.styleName = id
    node.className.push(`\${${id}}`)

    const css = Object.keys(staticStyle)
      .filter(
        key =>
          allowedStyleKeys.includes(key) && hasKeysInChildren(staticStyle[key])
      )
      .map(key =>
        asCss(asStaticCss(staticStyle[key]), key, scopedUnderParent).join('\n')
      )
      .join('\n')

    state.styles.push(`const ${id} = css\`${css}\``)
  }
}
