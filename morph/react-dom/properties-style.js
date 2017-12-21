import {
  getActionableParent,
  getAllowedStyleKeys,
  hasKeys,
  hasKeysInChildren,
  isList,
  isInList,
} from '../utils.js'
import getUnit from './get-style-value-unit-for-number.js'
import hash from '../hash.js'
import toSlugCase from 'to-slug-case'

const asDynamicCss = (styles, isInList = false) =>
  Object.keys(styles).map(
    prop =>
      `${toSlugCase(prop)}: \${${
        isInList ? '({ index, item, props })' : '({ props })'
      } => ${styles[prop]}}${getUnit(prop, styles[prop])};`
  )

const asStaticCss = styles =>
  Object.keys(styles).map(
    prop =>
      `${toSlugCase(prop)}: ${styles[prop]}${getUnit(prop, styles[prop])};`
  )

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
      .filter(key => allowedStyleKeys.includes(key) && hasKeys(dynamic[key]))
      .map(key =>
        asCss(
          [
            ...asDynamicCss(dynamic[key], isInList(node)),
            ...asStaticCss(staticStyle[key]),
          ],
          key,
          scopedUnderParent
        ).join('\n')
      )
      .join('\n')

    if (css) {
      state.styles[node.parent.name.finalValue] = `const ${
        node.parent.name.finalValue
      } = styled('${node.parent.name.tagValue}')\`${css}\``

      // TODO we may want to be smarter here and only pass what's needed
      state.render.push(` props={props}`)
      if (isInList(node) && !isList(parent)) {
        state.render.push(` index={index} item={item}`)
      }
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
      .join('\n')

    if (css) {
      state.styles[id] = `const ${id} = css\`${css}\``
    }
  }
}
