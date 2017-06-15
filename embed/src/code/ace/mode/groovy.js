import * as $_____lib_oop from '../lib/oop'
import * as $____javascript from './javascript'
import * as $____groovy_highlight_rules from './groovy_highlight_rules'

var oop = $_____lib_oop
var JavaScriptMode = $____javascript.Mode
var GroovyHighlightRules = $____groovy_highlight_rules.GroovyHighlightRules

export var Mode = function() {
  JavaScriptMode.call(this)
  this.HighlightRules = GroovyHighlightRules
}
oop.inherits(Mode, JavaScriptMode)
;(function() {
  this.createWorker = function(session) {
    return null
  }

  this.$id = 'ace/mode/groovy'
}.call(Mode.prototype))
