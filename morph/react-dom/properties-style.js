import {
  getActionableParent,
  getAllowedStyleKeys,
  hasKeys,
  hasKeysInChildren,
} from '../utils.js'
import hash from '../hash.js'

const asDynamicCss = styles =>
  Object.keys(styles).map(prop => `${prop}: ${styles[prop]}`)

const safe = str =>
  typeof str === 'string' ? `"${str.replace(/"/g, "'")}"` : str

const asStaticCss = (styles, dynamicStyles = []) =>
  Object.keys(styles)
    .filter(prop => !dynamicStyles.includes(prop))
    .map(prop => `${prop}: ${safe(styles[prop])}`)

const asCss = (styles, key, scopedUnderParent) => {
  let css = []

  if (key !== 'base') {
    if (scopedUnderParent) {
      let parent = `\${${scopedUnderParent}}`
      if (/_/.test(scopedUnderParent)) {
        parent = `.${parent}`
      }
      css.push(`[\`${parent}:${key} &, ${parent}.${key} &\`]: {`)
    } else if (
      key === 'hover' ||
      key === 'disabled' ||
      key === 'focus' ||
      key === 'placeholder'
    ) {
      css.push(`"&:${key}, &.${key}": {`)
    }
  }

  css.push(styles.join(',\n'))

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

    let cssStatic = Object.keys(staticStyle)
      .filter(
        key => allowedStyleKeys.includes(key) && hasKeys(staticStyle[key])
      )
      .map(key =>
        asCss(
          asStaticCss(staticStyle[key], Object.keys(dynamic[key])),
          key,
          scopedUnderParent
        ).join('\n')
      )
      .join(',\n')

    let cssDynamic = ['({ props }) => ({']
    cssDynamic = cssDynamic.concat(
      Object.keys(dynamic)
        .filter(key => allowedStyleKeys.includes(key) && hasKeys(dynamic[key]))
        .map(key =>
          asCss(asDynamicCss(dynamic[key]), key, scopedUnderParent).join('\n')
        )
        .join(',\n')
    )

    cssDynamic.push('})')
    cssDynamic = cssDynamic.join('\n')

    if (cssStatic || cssDynamic) {
      state.styles[node.parent.name.finalValue] = `const ${
        node.parent.name.finalValue
      } = styled('${node.parent.name.tagValue}')(${
        cssStatic ? `{${cssStatic}}, ` : ''
      }${cssDynamic})`

      // TODO we may want to be smarter here and only pass what's needed
      state.render.push(` props={props}`)
    }
  } else if (hasKeysInChildren(staticStyle)) {
    state.cssStatic = true

    const id = `${parent.is || parent.name.value}_${hash(staticStyle)}`
    parent.styleName = id
    node.className.push(`\${${id}}`)

    const css = Object.keys(staticStyle)
      .filter(
        key => allowedStyleKeys.includes(key) && hasKeys(staticStyle[key])
      )
      .map(key =>
        asCss(asStaticCss(staticStyle[key]), key, scopedUnderParent).join('\n')
      )
      .join(',\n')

    if (css) {
      state.styles[id] = `const ${id} = css({${css}})`
    }
  }
}
