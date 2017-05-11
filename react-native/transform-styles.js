import { hasCode } from './code.js'
import isUnitlessNumber from './is-unitless-number'
import toSlugCase from 'to-slug-case'
import transform from 'css-to-react-native'

const getValue = (key, value) =>
  typeof value === 'number' &&
    !(isUnitlessNumber.hasOwnProperty(key) && isUnitlessNumber[key])
    ? `${value}px`
    : value

const avoid = {}

const isValid = (key, value) => {
  return true
}

export default obj => {
  const list = Object.keys(obj)
  const listWithProps = list.filter(k => hasCode(obj[k]))
  const listWithoutProps = list.filter(
    k => !hasCode(obj[k]) && isValid(k, obj[k])
  )

  const res = transform(
    listWithoutProps.map(k => [toSlugCase(k), getValue(k, obj[k])])
  )

  listWithProps.forEach(k => (res[k] = obj[k]))

  return res
}
