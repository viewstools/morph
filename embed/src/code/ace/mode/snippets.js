import * as $_____lib_oop from '../lib/oop'
import * as $____text from './text'
import * as $____text_highlight_rules from './text_highlight_rules'
import * as $____folding_coffee from './folding/coffee'

var oop = $_____lib_oop
var TextMode = $____text.Mode
var TextHighlightRules = $____text_highlight_rules.TextHighlightRules

export var SnippetHighlightRules = function() {
  var builtins =
    'SELECTION|CURRENT_WORD|SELECTED_TEXT|CURRENT_LINE|LINE_INDEX|' +
    'LINE_NUMBER|SOFT_TABS|TAB_SIZE|FILENAME|FILEPATH|FULLNAME'

  this.$rules = {
    start: [
      { token: 'constant.language.escape', regex: /\\[\$}`\\]/ },
      { token: 'keyword', regex: '\\$(?:TM_)?(?:' + builtins + ')\\b' },
      { token: 'variable', regex: '\\$\\w+' },
      {
        onMatch: function(value, state, stack) {
          if (stack[1]) stack[1]++
          else stack.unshift(state, 1)
          return this.tokenName
        },
        tokenName: 'markup.list',
        regex: '\\${',
        next: 'varDecl',
      },
      {
        onMatch: function(value, state, stack) {
          if (!stack[1]) return 'text'
          stack[1]--
          if (!stack[1]) stack.splice(0, 2)
          return this.tokenName
        },
        tokenName: 'markup.list',
        regex: '}',
      },
      { token: 'doc.comment', regex: /^\${2}-{5,}$/ },
    ],
    varDecl: [
      { regex: /\d+\b/, token: 'constant.numeric' },
      { token: 'keyword', regex: '(?:TM_)?(?:' + builtins + ')\\b' },
      { token: 'variable', regex: '\\w+' },
      { regex: /:/, token: 'punctuation.operator', next: 'start' },
      { regex: /\//, token: 'string.regex', next: 'regexp' },
      { regex: '', next: 'start' },
    ],
    regexp: [
      { regex: /\\./, token: 'escape' },
      { regex: /\[/, token: 'regex.start', next: 'charClass' },
      { regex: '/', token: 'string.regex', next: 'format' },
      //{"default": "string.regex"},
      { token: 'string.regex', regex: '.' },
    ],
    charClass: [
      { regex: '\\.', token: 'escape' },
      { regex: '\\]', token: 'regex.end', next: 'regexp' },
      { token: 'string.regex', regex: '.' },
    ],
    format: [
      { regex: /\\[ulULE]/, token: 'keyword' },
      { regex: /\$\d+/, token: 'variable' },
      { regex: '/[gim]*:?', token: 'string.regex', next: 'start' },
      // {"default": "string"},
      { token: 'string', regex: '.' },
    ],
  }
}
oop.inherits(SnippetHighlightRules, TextHighlightRules)

export var SnippetGroupHighlightRules = function() {
  this.$rules = {
    start: [
      { token: 'text', regex: '^\\t', next: 'sn-start' },
      { token: 'invalid', regex: /^ \s*/ },
      { token: 'comment', regex: /^#.*/ },
      { token: 'constant.language.escape', regex: '^regex ', next: 'regex' },
      {
        token: 'constant.language.escape',
        regex:
          '^(trigger|endTrigger|name|snippet|guard|endGuard|tabTrigger|key)\\b',
      },
    ],
    regex: [
      { token: 'text', regex: '\\.' },
      { token: 'keyword', regex: '/' },
      { token: 'empty', regex: '$', next: 'start' },
    ],
  }
  this.embedRules(SnippetHighlightRules, 'sn-', [
    { token: 'text', regex: '^\\t', next: 'sn-start' },
    {
      onMatch: function(value, state, stack) {
        stack.splice(stack.length)
        return this.tokenName
      },
      tokenName: 'text',
      regex: '^(?!\t)',
      next: 'start',
    },
  ])
}

oop.inherits(SnippetGroupHighlightRules, TextHighlightRules)

var FoldMode = $____folding_coffee.FoldMode

export var Mode = function() {
  this.HighlightRules = SnippetGroupHighlightRules
  this.foldingRules = new FoldMode()
  this.$behaviour = this.$defaultBehaviour
}
oop.inherits(Mode, TextMode)
;(function() {
  this.$indentWithTabs = true
  this.lineCommentStart = '#'
  this.$id = 'ace/mode/snippets'
}.call(Mode.prototype))
