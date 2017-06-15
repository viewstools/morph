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
import * as $_____lib_lang from '../lib/lang'
import * as $_____worker_mirror from '../worker/mirror'
import * as $____css_csslint from './css/csslint'

var oop = $_____lib_oop
var lang = $_____lib_lang
var Mirror = $_____worker_mirror.Mirror
var CSSLint = $____css_csslint.CSSLint

Mirror.call(this, sender)
this.setTimeout(400)
this.ruleset = null
this.setDisabledRules('ids|order-alphabetical')
this.setInfoRules(
  'adjoining-classes|qualified-headings|zero-units|gradients|' +
    'import|outline-none|vendor-prefix'
)

oop.inherits(Worker, Mirror)
;(function() {
  this.setInfoRules = function(ruleNames) {
    if (typeof ruleNames == 'string') ruleNames = ruleNames.split('|')
    this.infoRules = lang.arrayToMap(ruleNames)
    this.doc.getValue() && this.deferredUpdate.schedule(100)
  }

  this.setDisabledRules = function(ruleNames) {
    if (!ruleNames) {
      this.ruleset = null
    } else {
      if (typeof ruleNames == 'string') ruleNames = ruleNames.split('|')
      var all = {}

      CSSLint.getRules().forEach(function(x) {
        all[x.id] = true
      })
      ruleNames.forEach(function(x) {
        delete all[x]
      })

      this.ruleset = all
    }
    this.doc.getValue() && this.deferredUpdate.schedule(100)
  }

  this.onUpdate = function() {
    var value = this.doc.getValue()
    if (!value) return this.sender.emit('annotate', [])
    var infoRules = this.infoRules

    var result = CSSLint.verify(value, this.ruleset)
    this.sender.emit(
      'annotate',
      result.messages.map(function(msg) {
        return {
          row: msg.line - 1,
          column: msg.col - 1,
          text: msg.message,
          type: infoRules[msg.rule.id] ? 'info' : msg.type,
          rule: msg.rule.name,
        }
      })
    )
  }
}.call(Worker.prototype))
