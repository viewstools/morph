import * as $_____lib_oop from '../lib/oop'
import * as $____text from './text'
import * as $____latex_highlight_rules from './latex_highlight_rules'
import * as $____folding_latex from './folding/latex'

var oop = $_____lib_oop
var TextMode = $____text.Mode
var LatexHighlightRules = $____latex_highlight_rules.LatexHighlightRules
var LatexFoldMode = $____folding_latex.FoldMode

export var Mode = function() {
  this.HighlightRules = LatexHighlightRules
  this.foldingRules = new LatexFoldMode()
  this.$behaviour = this.$defaultBehaviour
}
oop.inherits(Mode, TextMode)
;(function() {
  this.type = 'text'

  this.lineCommentStart = '%'

  this.$id = 'ace/mode/latex'
}.call(Mode.prototype))
