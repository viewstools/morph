import {
  isCode,
  isCodeInvalid,
  isData,
  isMargin,
  isPadding,
  isStyle,
} from './helpers.js'

export default (prop, value) => {
  const list = []

  isCode(value) && list.push('code')
  isCodeInvalid(value) && list.push('code:invalid')
  isData(value) && list.push('data')
  isMargin(prop) && list.push('margin')
  isPadding(prop) && list.push('padding')
  isStyle(prop) && list.push('style')

  return list
}
