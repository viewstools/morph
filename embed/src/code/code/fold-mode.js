import { FoldMode as BaseFoldMode } from '../ace/mode/folding/fold_mode.js'

export default class FoldMode extends BaseFoldMode {
  foldingStartMarker = /^[A-Z]/
  foldingStopMarker = /^$/
}
