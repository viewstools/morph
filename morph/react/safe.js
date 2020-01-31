import { isSlot } from '../utils.js'
import wrap from './wrap.js'

export default (value, node) =>
  typeof value === 'string' && !isSlot(value, node)
    ? JSON.stringify(value)
    : wrap(value)
