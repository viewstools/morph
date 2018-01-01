import { isCode, isCodeInvalid, isStyle } from './helpers.js'

export default (prop, value) => {
  const tags = {}

  if (isCode(value)) tags.code = isCodeInvalid(value) ? 'invalid' : true
  if (isStyle(prop)) tags.style = true

  return tags
}
