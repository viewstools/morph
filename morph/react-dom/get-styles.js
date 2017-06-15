import { hasKeys, hasKeysInChildren } from '../utils.js'
import { transform } from 'babel-core'
import isUnitlessNumber from '../react/is-unitless-number.js'
import toSlugCase from 'to-slug-case'
import glam from 'glam/babel'

export default ({ file, inlineStyles, styles }, name) => {
  if (!hasKeys(styles)) return ''

  const obj = Object.keys(styles)
    .filter(k => hasKeysInChildren(styles[k]))
    .map(k => `${JSON.stringify(k)}: css\`${toNestedCss(styles[k])}\``)
    .join(',')

  const code = transformGlam(`const styles = {${obj}}`, inlineStyles, file.raw)
  const maybeImport = inlineStyles ? '' : `import '${file.relative}.css'\n`
  return `${maybeImport}${code}`
}

const getValue = (key, value) =>
  typeof value === 'number' &&
    !(isUnitlessNumber.hasOwnProperty(key) && isUnitlessNumber[key])
    ? `${value}px`
    : `${value}`

const toCss = obj =>
  Object.keys(obj)
    .map(k => `${toSlugCase(k)}: ${getValue(k, obj[k])};`)
    .join('\n')

const toNestedCss = ({
  base,
  hover,
  active,
  activeHover,
  disabled,
  placeholder,
  print,
}) => {
  const baseCss = toCss(base)
  const hoverCss = toCss(hover)
  const activeCss = toCss(active)
  const activeHoverCss = toCss(activeHover)
  const disabledCss = toCss(disabled)
  const placeholderCss = toCss(placeholder)
  const printCss = toCss(print)

  const ret = [
    baseCss,
    hoverCss && `&:hover {${hoverCss}}`,
    activeCss && `&.active {${activeCss}}`,
    activeHoverCss && `&.active:hover {${activeHoverCss}}`,
    disabledCss && `&:disabled {${disabledCss}}`,
    placeholderCss && `&::placeholder {${placeholderCss}}`,
    printCss && `@media print {${printCss}}`,
  ]
    .filter(Boolean)
    .join('\n')

  return ret
}

const transformGlam = (code, inline, filename) =>
  transform(code, {
    babelrc: false,
    filename,
    plugins: [[glam, { inline }]],
  }).code
