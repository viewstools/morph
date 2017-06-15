import * as $_____lib_oop from '../lib/oop'
import * as $____html from './html'
import * as $____razor_highlight_rules from './razor_highlight_rules'
import * as $____razor_completions from './razor_completions'
import * as $____html_completions from './html_completions'

var oop = $_____lib_oop
var HtmlMode = $____html.Mode
var RazorHighlightRules = $____razor_highlight_rules.RazorHighlightRules
var RazorCompletions = $____razor_completions.RazorCompletions
var HtmlCompletions = $____html_completions.HtmlCompletions

export var Mode = function() {
  HtmlMode.call(this)
  this.$highlightRules = new RazorHighlightRules()
  this.$completer = new RazorCompletions()
  this.$htmlCompleter = new HtmlCompletions()
}
oop.inherits(Mode, HtmlMode)
;(function() {
  this.getCompletions = function(state, session, pos, prefix) {
    var razorToken = this.$completer.getCompletions(state, session, pos, prefix)
    var htmlToken = this.$htmlCompleter.getCompletions(
      state,
      session,
      pos,
      prefix
    )
    return razorToken.concat(htmlToken)
  }

  this.createWorker = function(session) {
    return null
  }

  this.$id = 'ace/mode/razor'
}.call(Mode.prototype))
