import { hasKeys } from '../utils.js'

export default ({ styles }) =>
  hasKeys(styles)
    ? `let styles = StyleSheet.create(${JSON.stringify(styles)})`
    : ''
