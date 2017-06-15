/* ***** BEGIN LICENSE BLOCK *****
 * Distributed under the BSD license:
 *
 * Copyright (c) 2012, Ajax.org B.V.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of Ajax.org B.V. nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL AJAX.ORG B.V. BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * ***** END LICENSE BLOCK ***** */

import * as $_____lib_oop from '../lib/oop'
import * as $____text from './text'
import * as $____logiql_highlight_rules from './logiql_highlight_rules'
import * as $____folding_coffee from './folding/coffee'
import * as $_____token_iterator from '../token_iterator'
import * as $_____range from '../range'
import * as $____behaviour_cstyle from './behaviour/cstyle'
import * as $____matching_brace_outdent from './matching_brace_outdent'

var oop = $_____lib_oop
var TextMode = $____text.Mode
var LogiQLHighlightRules = $____logiql_highlight_rules.LogiQLHighlightRules
var FoldMode = $____folding_coffee.FoldMode
var TokenIterator = $_____token_iterator.TokenIterator
var Range = $_____range.Range
var CstyleBehaviour = $____behaviour_cstyle.CstyleBehaviour
var MatchingBraceOutdent = $____matching_brace_outdent.MatchingBraceOutdent

export var Mode = function() {
  this.HighlightRules = LogiQLHighlightRules
  this.foldingRules = new FoldMode()
  this.$outdent = new MatchingBraceOutdent()
  this.$behaviour = new CstyleBehaviour()
}
oop.inherits(Mode, TextMode)
;(function() {
  this.lineCommentStart = '//'
  this.blockComment = { start: '/*', end: '*/' }

  this.getNextLineIndent = function(state, line, tab) {
    var indent = this.$getIndent(line)

    var tokenizedLine = this.getTokenizer().getLineTokens(line, state)
    var tokens = tokenizedLine.tokens
    var endState = tokenizedLine.state
    if (/comment|string/.test(endState)) return indent
    if (tokens.length && tokens[tokens.length - 1].type == 'comment.single')
      return indent

    var match = line.match()
    if (/(-->|<--|<-|->|{)\s*$/.test(line)) indent += tab
    return indent
  }

  this.checkOutdent = function(state, line, input) {
    if (this.$outdent.checkOutdent(line, input)) return true

    if (input !== '\n' && input !== '\r\n') return false

    if (!/^\s+/.test(line)) return false

    return true
  }

  this.autoOutdent = function(state, doc, row) {
    if (this.$outdent.autoOutdent(doc, row)) return
    var prevLine = doc.getLine(row)
    var match = prevLine.match(/^\s+/)
    var column = prevLine.lastIndexOf('.') + 1
    if (!match || !row || !column) return 0

    var line = doc.getLine(row + 1)
    var startRange = this.getMatching(doc, { row: row, column: column })
    if (!startRange || startRange.start.row == row) return 0

    column = match[0].length
    var indent = this.$getIndent(doc.getLine(startRange.start.row))
    doc.replace(new Range(row + 1, 0, row + 1, column), indent)
  }

  this.getMatching = function(session, row, column) {
    if (row == undefined) row = session.selection.lead
    if (typeof row == 'object') {
      column = row.column
      row = row.row
    }

    var startToken = session.getTokenAt(row, column)
    var KW_START = 'keyword.start',
      KW_END = 'keyword.end'
    var tok
    if (!startToken) return
    if (startToken.type == KW_START) {
      var it = new TokenIterator(session, row, column)
      it.step = it.stepForward
    } else if (startToken.type == KW_END) {
      var it = new TokenIterator(session, row, column)
      it.step = it.stepBackward
    } else return

    while ((tok = it.step())) {
      if (tok.type == KW_START || tok.type == KW_END) break
    }
    if (!tok || tok.type == startToken.type) return

    var col = it.getCurrentTokenColumn()
    var row = it.getCurrentTokenRow()
    return new Range(row, col, row, col + tok.value.length)
  }
  this.$id = 'ace/mode/logiql'
}.call(Mode.prototype))
