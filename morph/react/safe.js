import wrap from './wrap.js'

export default value =>
  typeof value === 'string' && !/props|item/.test(value)
    ? JSON.stringify(value)
    : wrap(value)
