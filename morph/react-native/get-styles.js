import { hasKeys } from '../utils.js'

export default ({ styles }) => {
  debugger
  return hasKeys(styles)
    ? `const styles = StyleSheet.create(${JSON.stringify(styles)})`
    : ''
}
