import * as $_____lib_oop from '../lib/oop'
import * as $____text from './text'
import * as $____gitignore_highlight_rules from './gitignore_highlight_rules'

var oop = $_____lib_oop
var TextMode = $____text.Mode
var GitignoreHighlightRules =
  $____gitignore_highlight_rules.GitignoreHighlightRules

export var Mode = function() {
  this.HighlightRules = GitignoreHighlightRules
  this.$behaviour = this.$defaultBehaviour
}
oop.inherits(Mode, TextMode)
;(function() {
  this.lineCommentStart = '#'
  this.$id = 'ace/mode/gitignore'
}.call(Mode.prototype))
