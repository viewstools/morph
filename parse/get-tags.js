import {
  getToggle,
  isCode,
  isCodeInvalid,
  isData,
  isMargin,
  isPadding,
  isStyle,
  isToggle,
} from './helpers.js'

export default (prop, value) => {
  const tags = {}

  if (isCode(value)) tags.code = isCodeInvalid(value) ? 'invalid' : true
  if (isData(value)) tags.data = true
  if (isMargin(prop)) tags.margin = true
  if (isPadding(prop)) tags.padding = true
  if (isStyle(prop)) tags.style = true
  if (isToggle(value)) tags.toggle = getToggle(value)

  return tags
}
