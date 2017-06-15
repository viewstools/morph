import * as $_____lib_oop from '../lib/oop'
import * as $____text from './text'
import * as $____folding_coffee from './folding/coffee'
import * as $____space_highlight_rules from './space_highlight_rules'

var oop = $_____lib_oop
// defines the parent mode
var TextMode = $____text.Mode
var FoldMode = $____folding_coffee.FoldMode
// defines the language specific highlighters and folding rules
var SpaceHighlightRules = $____space_highlight_rules.SpaceHighlightRules
export var Mode = function() {
  // set everything up
  this.HighlightRules = SpaceHighlightRules
  this.foldingRules = new FoldMode()
  this.$behaviour = this.$defaultBehaviour
}
oop.inherits(Mode, TextMode)
;(function() {
  this.$id = 'ace/mode/space'
}.call(Mode.prototype))
