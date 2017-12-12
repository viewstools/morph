import { hasKeys, hasKeysInChildren } from '../utils.js'
import isUnitlessNumber from '../react/is-unitless-number.js'
import toSlugCase from 'to-slug-case'

export default ({ debug, styles, stylesDynamic }, name) => {
  if (!hasKeys(styles) && stylesDynamic.length === 0) return ''

  const obj = Object.keys(styles)
    .filter(k => hasKeysInChildren(styles[k]))
    .map(k => `${JSON.stringify(k)}: css\`${toNestedCss(styles[k], debug)}\``)
    .join(',')

  debugger
  const code = `const styles = {${obj}}`
  const maybeImport = [
    stylesDynamic.length > 0
      ? 'import styled, { css } from "react-emotion"'
      : 'import { css } from "react-emotion"',
  ]
    .filter(Boolean)
    .join(';\n')

  return `${maybeImport}\n${code}\n${stylesDynamic.join('\n')}`
}

const getKey = raw => {
  const key = toSlugCase(raw)
  return raw.startsWith('Webkit') ? `-${key}` : key
}

const getValue = (key, value) =>
  typeof value === 'number' &&
  !(isUnitlessNumber.hasOwnProperty(key) && isUnitlessNumber[key])
    ? `${value}px`
    : `${value}`

const toCss = obj =>
  Object.keys(obj)
    .map(k => `${getKey(k)}: ${getValue(k, obj[k])};`)
    .join('\n')

const toNestedCss = (
  { base, hover, focus, active, activeHover, disabled, placeholder, print },
  debug
) => {
  const baseCss = toCss(base)
  const hoverCss = toCss(hover)
  const focusCss = toCss(focus)
  const activeCss = toCss(active)
  const activeHoverCss = toCss(activeHover)
  const disabledCss = toCss(disabled)
  const placeholderCss = toCss(placeholder)
  const printCss = toCss(print)

  const ret = [
    baseCss,
    hoverCss && `&:hover${debug ? ', &.hover' : ''} {${hoverCss}}`,
    focusCss && `&:focus${debug ? ', &.focus' : ''} {${focusCss}}`,
    activeCss && `&.active {${activeCss}}`,
    activeHoverCss &&
      `&.active:hover${debug ? ', &.active-hover' : ''} {${activeHoverCss}}`,
    disabledCss && `&:disabled${debug ? ', &.disabled' : ''} {${disabledCss}}`,
    placeholderCss &&
      `&::placeholder${debug ? ', &.placeholder' : ''} {${placeholderCss}}`,
    printCss && `@media print${debug ? ', &.media-print' : ''} {${printCss}}`,
  ]
    .filter(Boolean)
    .join('\n')

  return ret
}
