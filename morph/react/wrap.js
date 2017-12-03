import { isCodeExplicit } from '../utils.js'
export default s => (isCodeExplicit(s) ? s : `{${s}}`)
