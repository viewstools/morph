import { isCode, isStyle } from './helpers.js'

const CODE_PROPS = ['from', 'when', 'onClick', 'onFocus', 'onWhen']
const shouldBeCode = prop => CODE_PROPS.includes(prop) || /^on[A-Z]/.test(prop)

export default (prop, value) => {
  const tags = {}

  if (shouldBeCode(prop)) tags.shouldBeCode = true
  if (isCode(value)) tags.code = true
  if (isStyle(prop)) tags.style = true

  return tags
}
