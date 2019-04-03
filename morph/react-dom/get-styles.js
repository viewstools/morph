import { hasKeys } from '../utils.js'

export default ({ styles }) =>
  hasKeys(styles) ? `let styles = ${JSON.stringify(styles)}` : ''
