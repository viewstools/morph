import { getCodeData, isCode } from './helpers.js'

export default (value, line, startLine) => {
  if (!isCode(value)) return []

  return getCodeData(value).map(value => ({
    tag: 'code',
    value,
  }))
}
