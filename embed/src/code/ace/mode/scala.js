import * as $_____lib_oop from '../lib/oop'
import * as $____javascript from './javascript'
import * as $____scala_highlight_rules from './scala_highlight_rules'

var oop = $_____lib_oop
var JavaScriptMode = $____javascript.Mode
var ScalaHighlightRules = $____scala_highlight_rules.ScalaHighlightRules

export var Mode = function() {
  JavaScriptMode.call(this)
  this.HighlightRules = ScalaHighlightRules
}
oop.inherits(Mode, JavaScriptMode)
;(function() {
  this.createWorker = function(session) {
    return null
  }

  this.$id = 'ace/mode/scala'
}.call(Mode.prototype))
