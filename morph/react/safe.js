import { isCode } from '../utils.js'
import wrap from './wrap.js'

export default value =>
  typeof value === 'string' && !isCode(value)
    ? JSON.stringify(value)
    : wrap(value)
