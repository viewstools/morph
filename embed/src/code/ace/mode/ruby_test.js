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

if (typeof process !== 'undefined') {
  $__amd_loader
}

import * as $__amd_loader from 'amd-loader'
import * as $_____edit_session from '../edit_session'
import * as $____ruby from './ruby'
import * as $_____test_assertions from '../test/assertions'
import * as $__asyncjs from 'asyncjs'

var EditSession = $_____edit_session.EditSession
var Mode = $____ruby.Mode
var assert = $_____test_assertions

module.exports = {
  setUp: function() {
    this.mode = new Mode()
  },

  'test getNextLineIndent': function() {
    assert.equal(this.mode.getNextLineIndent('start', 'class Foo', '  '), '  ')
    assert.equal(
      this.mode.getNextLineIndent('start', '  def thing(wut)', '  '),
      '    '
    )
    assert.equal(
      this.mode.getNextLineIndent('start', '  fork do', '  '),
      '    '
    )
    assert.equal(
      this.mode.getNextLineIndent('start', '  fork do |wut| ', '  '),
      '    '
    )
    assert.equal(
      this.mode.getNextLineIndent('start', '  something = :ruby', '  '),
      '  '
    )
    assert.equal(
      this.mode.getNextLineIndent('start', '  if something == 3', '  '),
      '    '
    )
    assert.equal(this.mode.getNextLineIndent('start', '  else', '  '), '    ')
  },

  'test: checkOutdent': function() {
    assert.ok(this.mode.checkOutdent('start', '        en', 'd'))
    assert.ok(this.mode.checkOutdent('start', '        els', 'e'))
    assert.ok(this.mode.checkOutdent('start', '        ', '}'))
    assert.equal(this.mode.checkOutdent('start', '  end', '\n'), false)
    assert.equal(this.mode.checkOutdent('start', 'foo = ba', 'r'), false)
  },

  'test: auto outdent': function() {
    var session = new EditSession(['class Phil', "  Foo = 'bar'", '  end'])
    this.mode.autoOutdent('start', session, 2)
    assert.equal('  end', session.getLine(2))
  },
}

if (typeof module !== 'undefined' && module === require.main) {
  $__asyncjs.test.testcase(module.exports).exec()
}
