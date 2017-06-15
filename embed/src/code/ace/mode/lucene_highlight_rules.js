import * as $_____lib_oop from '../lib/oop'
import * as $_____lib_lang from '../lib/lang'
import * as $____text_highlight_rules from './text_highlight_rules'

var oop = $_____lib_oop
var lang = $_____lib_lang
var TextHighlightRules = $____text_highlight_rules.TextHighlightRules

export var LuceneHighlightRules = function() {
  this.$rules = {
    start: [
      {
        token: 'constant.character.negation',
        regex: '[\\-]',
      },
      {
        token: 'constant.character.interro',
        regex: '[\\?]',
      },
      {
        token: 'constant.character.asterisk',
        regex: '[\\*]',
      },
      {
        token: 'constant.character.proximity',
        regex: '~[0-9]+\\b',
      },
      {
        token: 'keyword.operator',
        regex: '(?:AND|OR|NOT)\\b',
      },
      {
        token: 'paren.lparen',
        regex: '[\\(]',
      },
      {
        token: 'paren.rparen',
        regex: '[\\)]',
      },
      {
        token: 'keyword',
        regex: '[\\S]+:',
      },
      {
        token: 'string', // " string
        regex: '".*?"',
      },
      {
        token: 'text',
        regex: '\\s+',
      },
    ],
  }
}

oop.inherits(LuceneHighlightRules, TextHighlightRules)
