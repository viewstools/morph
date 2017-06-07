import { hasKeys } from '../utils.js'
import { transform } from 'babel-core'
import isUnitlessNumber from '../react/is-unitless-number.js'
import toSlugCase from 'to-slug-case'

export default styles => {
  if (!hasKeys(styles)) return ''

  const obj = Object.keys(styles)
    .map(k => `${JSON.stringify(k)}: css\`${toNestedCss(styles[k])}\``)
    .join(',')

  return transformGlam(`const styles = {${obj}}`).code
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
}) => {
  const baseCss = toCss(base)
  const hoverCss = toCss(hover)
  const activeCss = toCss(active)
  const activeHoverCss = toCss(activeHover)
  const disabledCss = toCss(disabled)
  const placeholderCss = toCss(placeholder)

  const ret = [
    baseCss,
    hoverCss && `&:hover {${hoverCss}}`,
    activeCss && `&.active {${activeCss}}`,
    activeHoverCss && `&.active:hover {${activeHoverCss}}`,
    disabledCss && `&:disabled {${disabledCss}}`,
    placeholderCss && `&::placeholder {${placeholderCss}}`,
  ]
    .filter(Boolean)
    .join('\n')

  return ret
}

const transformGlam = code =>
  transform(code, {
    babelrc: false,
    plugins: [[require.resolve('glam/babel'), { inline: true }]],
  })
