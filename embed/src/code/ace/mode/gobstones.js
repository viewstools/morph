import * as $_____lib_oop from '../lib/oop'
import * as $____javascript from './javascript'
import * as $____gobstones_highlight_rules from './gobstones_highlight_rules'

var oop = $_____lib_oop
var JavaScriptMode = $____javascript.Mode
var GobstonesHighlightRules =
  $____gobstones_highlight_rules.GobstonesHighlightRules

export var Mode = function() {
  JavaScriptMode.call(this)
  this.HighlightRules = GobstonesHighlightRules
  this.$behaviour = this.$defaultBehaviour
}
oop.inherits(Mode, JavaScriptMode)
;(function() {
  this.createWorker = function(session) {
    return null
  }

  this.$id = 'ace/mode/gobstones'
}.call(Mode.prototype))
