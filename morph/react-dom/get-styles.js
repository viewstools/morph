import { hasKeys } from '../utils.js'

export default ({ styles, stylesOrder }) => {
  if (!hasKeys(styles)) return ''

  return stylesOrder.map((id) => `.${id} {\n${styles[id]}\n}`).join('\n')
}
