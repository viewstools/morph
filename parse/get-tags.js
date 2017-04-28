import { isCode, isCodeInvalid, isMargin, isPadding, isStyle } from './helpers.js'

export default (prop, value) => {
  const list = []

  isCode(value) && list.push('code')
  isCodeInvalid(value) && list.push('code:invalid')
  isMargin(prop) && list.push('margin')
  isPadding(prop) && list.push('padding')
  isStyle(prop) && list.push('style')

  return list
}
