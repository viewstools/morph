import { isProps } from '../utils.js'
import wrap from './wrap.js'

export default value =>
  typeof value === 'string' && !isProps(value)
    ? JSON.stringify(value)
    : wrap(value)
