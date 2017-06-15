/* ***** BEGIN LICENSE BLOCK *****
 * Distributed under the BSD license:
 *
 * Copyright (c) 2010, Ajax.org B.V.
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
import * as $____c_cpp_highlight_rules from './c_cpp_highlight_rules'
import * as $____matching_brace_outdent from './matching_brace_outdent'
import * as $_____range from '../range'
import * as $____behaviour_cstyle from './behaviour/cstyle'
import * as $____folding_cstyle from './folding/cstyle'

var oop = $_____lib_oop
var TextMode = $____text.Mode
var c_cppHighlightRules = $____c_cpp_highlight_rules.c_cppHighlightRules
var MatchingBraceOutdent = $____matching_brace_outdent.MatchingBraceOutdent
var Range = $_____range.Range
var CstyleBehaviour = $____behaviour_cstyle.CstyleBehaviour
var CStyleFoldMode = $____folding_cstyle.FoldMode

export var Mode = function() {
  this.HighlightRules = c_cppHighlightRules

  this.$outdent = new MatchingBraceOutdent()
  this.$behaviour = new CstyleBehaviour()

  this.foldingRules = new CStyleFoldMode()
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

    if (tokens.length && tokens[tokens.length - 1].type == 'comment') {
      return indent
    }

    if (state == 'start') {
      var match = line.match(/^.*[\{\(\[]\s*$/)
      if (match) {
        indent += tab
      }
    } else if (state == 'doc-start') {
      if (endState == 'start') {
        return ''
      }
      var match = line.match(/^\s*(\/?)\*/)
      if (match) {
        if (match[1]) {
          indent += ' '
        }
        indent += '* '
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

  this.$id = 'ace/mode/c_cpp'
}.call(Mode.prototype))
