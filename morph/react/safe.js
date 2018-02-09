import { isSlot } from '../utils.js'
import wrap from './wrap.js'

export default value =>
  typeof value === 'string' && !isSlot(value)
    ? JSON.stringify(value)
    : wrap(value)
