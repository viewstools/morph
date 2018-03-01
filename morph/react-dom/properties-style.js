import { enter } from '../react/properties-style.js'
import {
  getActionableParent,
  getAllowedStyleKeys,
  hasKeys,
  hasKeysInChildren,
} from '../utils.js'
import hash from '../hash.js'
import flatten from 'flatten'
import toSlugCase from 'to-slug-case'

export { enter }

export function leave(node, parent, state) {
  const { dynamic, static: staticStyle } = node.style

  const allowedStyleKeys = getAllowedStyleKeys(node)
  let scopedUnderParent =
    !node.isCapture && !node.action && getActionableParent(node)
  if (scopedUnderParent) {
    scopedUnderParent = scopedUnderParent.styleName
  }

  // dynamic merges static styles
  if (hasKeysInChildren(dynamic)) {
    state.cssDynamic = true
    node.styleName = node.nameFinal

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

    if (node.isAnimated) {
      cssStatic = cssStatic + asAnimatedCss(node)
    }

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
      state.styles[
        node.nameFinal
      ] = `const ${node.nameFinal} = styled('${node.nameTag}')(${cssStatic
        ? `{${cssStatic}}, `
        : ''}${cssDynamic})`

      // TODO we may want to be smarter here and only pass what's needed
      state.render.push(` props={props}`)
    }
  } else if (hasKeysInChildren(staticStyle)) {
    state.cssStatic = true

    const id = `${node.is || node.name}_${hash(staticStyle)}`
    node.styleName = id
    node.className.push(`\${${id}}`)

    let css = Object.keys(staticStyle)
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

const asAnimatedCss = node => {
  const animatedProps = flatten(
    node.scopes.map(scope => scope.properties.filter(prop => prop.animation))
  )

  //TODO handle delay
  const names = animatedProps.map(prop => `${toSlugCase(prop.name)}`)

  let transition = ''
  animatedProps.forEach((prop, i) => {
    if (i === 0) {
      transition += makeTransition(names[i], prop.animation)
    } else {
      transition += `, ${makeTransition(names[i], prop.animation)}`
    }
  })

  return `,\ntransition: '${transition}',\nwillChange: '${names.join(', ')}'`
}

const makeTransition = (name, animation) =>
  `${name} ${animation.duration}ms ${toSlugCase(animation.curve)}`

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
    } else if (key === 'print') {
      // TODO can we use this to support all media queries?
      css.push('"@media print": {')
    }
  }

  css.push(styles.join(',\n'))

  if (key !== 'base') css.push(`}`)

  return css
}
