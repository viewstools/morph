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

import * as $_____snippets from '../snippets.js'
import * as $_____autocomplete from '../autocomplete.js'
import $_____config from '../config'
import * as $_____lib_lang from '../lib/lang'
import * as $_____autocomplete_util from '../autocomplete/util'
import * as $_____autocomplete_text_completer from '../autocomplete/text_completer'
import * as $_____editor from '../editor'

var snippetManager = $_____snippets.snippetManager
var Autocomplete = $_____autocomplete.Autocomplete
var config = $_____config
var lang = $_____lib_lang
var util = $_____autocomplete_util

export var textCompleter = $_____autocomplete_text_completer
export var keyWordCompleter = {
  getCompletions: function(editor, session, pos, prefix, callback) {
    if (session.$mode.completer) {
      return session.$mode.completer.getCompletions(
        editor,
        session,
        pos,
        prefix,
        callback
      )
    }
    var state = editor.session.getState(pos.row)
    var completions = session.$mode.getCompletions(state, session, pos, prefix)
    callback(null, completions)
  },
}

export var snippetCompleter = {
  getCompletions: function(editor, session, pos, prefix, callback) {
    var snippetMap = snippetManager.snippetMap
    var completions = []
    snippetManager.getActiveScopes(editor).forEach(function(scope) {
      var snippets = snippetMap[scope] || []
      for (var i = snippets.length; i--; ) {
        var s = snippets[i]
        var caption = s.name || s.tabTrigger
        if (!caption) continue
        completions.push({
          caption: caption,
          snippet: s.content,
          meta: s.tabTrigger && !s.name ? s.tabTrigger + '\u21E5 ' : 'snippet',
          type: 'snippet',
        })
      }
    }, this)
    callback(null, completions)
  },
  getDocTooltip: function(item) {
    if (item.type == 'snippet' && !item.docHTML) {
      item.docHTML = [
        '<b>',
        lang.escapeHTML(item.caption),
        '</b>',
        '<hr></hr>',
        lang.escapeHTML(item.snippet),
      ].join('')
    }
  },
}

var completers = [snippetCompleter, textCompleter, keyWordCompleter]
// Modifies list of default completers
export var setCompleters = function(val) {
  completers.length = 0
  if (val) completers.push.apply(completers, val)
}
export var addCompleter = function(completer) {
  completers.push(completer)
}

// Exports existing completer so that user can construct his own set of completers.

var expandSnippet = {
  name: 'expandSnippet',
  exec: function(editor) {
    return snippetManager.expandWithTab(editor)
  },
  bindKey: 'Tab',
}

var onChangeMode = function(e, editor) {
  loadSnippetsForMode(editor.session.$mode)
}

var loadSnippetsForMode = function(mode) {
  var id = mode.$id
  if (!snippetManager.files) snippetManager.files = {}
  loadSnippetFile(id)
  if (mode.modes) mode.modes.forEach(loadSnippetsForMode)
}

var loadSnippetFile = function(id) {
  if (!id || snippetManager.files[id]) return
  var snippetFilePath = id.replace('mode', 'snippets')
  snippetManager.files[id] = {}
  config.loadModule(snippetFilePath, function(m) {
    if (m) {
      snippetManager.files[id] = m
      if (!m.snippets && m.snippetText)
        m.snippets = snippetManager.parseSnippetFile(m.snippetText)
      snippetManager.register(m.snippets || [], m.scope)
      if (m.includeScopes) {
        snippetManager.snippetMap[m.scope].includeScopes = m.includeScopes
        m.includeScopes.forEach(function(x) {
          loadSnippetFile('ace/mode/' + x)
        })
      }
    }
  })
}

var doLiveAutocomplete = function(e) {
  var editor = e.editor
  var hasCompleter = editor.completer && editor.completer.activated

  // We don't want to autocomplete with no prefix
  if (e.command.name === 'backspace') {
    if (hasCompleter && !util.getCompletionPrefix(editor))
      editor.completer.detach()
  } else if (e.command.name === 'insertstring') {
    var prefix = util.getCompletionPrefix(editor)
    // Only autocomplete if there's a prefix that can be matched
    if (prefix && !hasCompleter) {
      if (!editor.completer) {
        // Create new autocompleter
        editor.completer = new Autocomplete()
      }
      // Disable autoInsert
      editor.completer.autoInsert = false
      editor.completer.showPopup(editor)
    }
  }
}

var Editor = $_____editor.Editor
$_____config.defineOptions(Editor.prototype, 'editor', {
  enableBasicAutocompletion: {
    set: function(val) {
      if (val) {
        if (!this.completers)
          this.completers = Array.isArray(val) ? val : completers
        this.commands.addCommand(Autocomplete.startCommand)
      } else {
        this.commands.removeCommand(Autocomplete.startCommand)
      }
    },
    value: false,
  },
  /**
     * Enable live autocomplete. If the value is an array, it is assumed to be an array of completers
     * and will use them instead of the default completers.
     */
  enableLiveAutocompletion: {
    set: function(val) {
      if (val) {
        if (!this.completers)
          this.completers = Array.isArray(val) ? val : completers
        // On each change automatically trigger the autocomplete
        this.commands.on('afterExec', doLiveAutocomplete)
      } else {
        this.commands.removeListener('afterExec', doLiveAutocomplete)
      }
    },
    value: false,
  },
  enableSnippets: {
    set: function(val) {
      if (val) {
        this.commands.addCommand(expandSnippet)
        this.on('changeMode', onChangeMode)
        onChangeMode(null, this)
      } else {
        this.commands.removeCommand(expandSnippet)
        this.off('changeMode', onChangeMode)
      }
    },
    value: false,
  },
})
