import * as $_____lib_oop from '../lib/oop'
import * as $____text from './text'
import * as $____lucene_highlight_rules from './lucene_highlight_rules'

var oop = $_____lib_oop
var TextMode = $____text.Mode
var LuceneHighlightRules = $____lucene_highlight_rules.LuceneHighlightRules

export var Mode = function() {
  this.HighlightRules = LuceneHighlightRules
  this.$behaviour = this.$defaultBehaviour
}

oop.inherits(Mode, TextMode)
;(function() {
  this.$id = 'ace/mode/lucene'
}.call(Mode.prototype))
