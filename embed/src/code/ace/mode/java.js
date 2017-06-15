import * as $_____lib_oop from '../lib/oop'
import * as $____javascript from './javascript'
import * as $____java_highlight_rules from './java_highlight_rules'

var oop = $_____lib_oop
var JavaScriptMode = $____javascript.Mode
var JavaHighlightRules = $____java_highlight_rules.JavaHighlightRules

export var Mode = function() {
  JavaScriptMode.call(this)
  this.HighlightRules = JavaHighlightRules
}
oop.inherits(Mode, JavaScriptMode)
;(function() {
  this.createWorker = function(session) {
    return null
  }

  this.$id = 'ace/mode/java'
}.call(Mode.prototype))
