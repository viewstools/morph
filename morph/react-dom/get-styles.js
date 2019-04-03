import { hasKeys } from '../utils.js'

export default ({ styles, stylesOrder }) => {
  if (!hasKeys(styles)) return ''

  let res = [`let styles = {}`]

  stylesOrder.forEach(id => {
    res.push(`styles.${id} = ${styles[id]}`)
  })

  return res.join('\n')
}
