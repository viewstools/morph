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
import * as $____text from './text'
import * as $____xml_highlight_rules from './xml_highlight_rules'
import * as $____behaviour_xml from './behaviour/xml'
import * as $____folding_xml from './folding/xml'
import * as $_____worker_worker_client from '../worker/worker_client'

var oop = $_____lib_oop
var lang = $_____lib_lang
var TextMode = $____text.Mode
var XmlHighlightRules = $____xml_highlight_rules.XmlHighlightRules
var XmlBehaviour = $____behaviour_xml.XmlBehaviour
var XmlFoldMode = $____folding_xml.FoldMode
var WorkerClient = $_____worker_worker_client.WorkerClient

export var Mode = function() {
  this.HighlightRules = XmlHighlightRules
  this.$behaviour = new XmlBehaviour()
  this.foldingRules = new XmlFoldMode()
}

oop.inherits(Mode, TextMode)
;(function() {
  this.voidElements = lang.arrayToMap([])

  this.blockComment = { start: '<!--', end: '-->' }

  this.createWorker = function(session) {
    var worker = new WorkerClient(['ace'], 'ace/mode/xml_worker', 'Worker')
    worker.attachToDocument(session.getDocument())

    worker.on('error', function(e) {
      session.setAnnotations(e.data)
    })

    worker.on('terminate', function() {
      session.clearAnnotations()
    })

    return worker
  }

  this.$id = 'ace/mode/xml'
}.call(Mode.prototype))
