import * as $_____lib_oop from '../lib/oop'
import * as $____javascript from './javascript'
import * as $____wollok_highlight_rules from './wollok_highlight_rules'

var oop = $_____lib_oop
var JavaScriptMode = $____javascript.Mode
var WollokHighlightRules = $____wollok_highlight_rules.WollokHighlightRules

export var Mode = function() {
  JavaScriptMode.call(this)
  this.HighlightRules = WollokHighlightRules
}
oop.inherits(Mode, JavaScriptMode)
;(function() {
  this.createWorker = function(session) {
    return null
  }

  this.$id = 'ace/mode/wollok'
}.call(Mode.prototype))
