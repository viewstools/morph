import wrap from './wrap.js'

export default (value, node) =>
  typeof value === 'string' && !/props|item/.test(value)
    ? JSON.stringify(value)
    : wrap(value)
