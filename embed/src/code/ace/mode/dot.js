import * as $_____lib_oop from '../lib/oop'
import * as $____text from './text'
import * as $____matching_brace_outdent from './matching_brace_outdent'
import * as $____dot_highlight_rules from './dot_highlight_rules'
import * as $____folding_cstyle from './folding/cstyle'

var oop = $_____lib_oop
var TextMode = $____text.Mode
var MatchingBraceOutdent = $____matching_brace_outdent.MatchingBraceOutdent
var DotHighlightRules = $____dot_highlight_rules.DotHighlightRules
var DotFoldMode = $____folding_cstyle.FoldMode

export var Mode = function() {
  this.HighlightRules = DotHighlightRules
  this.$outdent = new MatchingBraceOutdent()
  this.foldingRules = new DotFoldMode()
  this.$behaviour = this.$defaultBehaviour
}
oop.inherits(Mode, TextMode)
;(function() {
  this.lineCommentStart = ['//', '#']
  this.blockComment = { start: '/*', end: '*/' }

  this.getNextLineIndent = function(state, line, tab) {
    var indent = this.$getIndent(line)

    var tokenizedLine = this.getTokenizer().getLineTokens(line, state)
    var tokens = tokenizedLine.tokens
    var endState = tokenizedLine.state

    if (tokens.length && tokens[tokens.length - 1].type == 'comment') {
      return indent
    }

    if (state == 'start') {
      var match = line.match(/^.*(?:\bcase\b.*:|[\{\(\[])\s*$/)
      if (match) {
        indent += tab
      }
    }

    return indent
  }

  this.checkOutdent = function(state, line, input) {
    return this.$outdent.checkOutdent(line, input)
  }

  this.autoOutdent = function(state, doc, row) {
    this.$outdent.autoOutdent(doc, row)
  }

  this.$id = 'ace/mode/dot'
}.call(Mode.prototype))
