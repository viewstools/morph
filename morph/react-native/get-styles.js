import { hasKeys } from '../utils.js'

export default styles =>
  hasKeys(styles)
    ? `const styles = StyleSheet.create(${JSON.stringify(styles)})`
    : ''
