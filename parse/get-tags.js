import { getScope, isCode, isCodeInvalid, isScope, isStyle } from './helpers.js'

export default (prop, value) => {
  const tags = {}

  if (isCode(value)) tags.code = isCodeInvalid(value) ? 'invalid' : true
  if (isStyle(prop)) tags.style = true
  if (isScope(value)) tags.scope = getScope(value)

  return tags
}
