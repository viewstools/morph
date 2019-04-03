import { hasKeys } from '../utils.js'

export default ({ styles }) => {
  if (!hasKeys(styles)) return ''

  let res = [`let styles = {`]

  Object.entries(styles).forEach(([id, css]) => {
    res.push(`${id}: ${css},`)
  })

  res.push('}')

  return res.join('\n')
}
