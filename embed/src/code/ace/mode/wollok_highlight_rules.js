import * as $_____lib_oop from '../lib/oop'
import * as $____doc_comment_highlight_rules from './doc_comment_highlight_rules'
import * as $____text_highlight_rules from './text_highlight_rules'

var oop = $_____lib_oop
var DocCommentHighlightRules =
  $____doc_comment_highlight_rules.DocCommentHighlightRules
var TextHighlightRules = $____text_highlight_rules.TextHighlightRules

export var WollokHighlightRules = function() {
  // taken from http://download.oracle.com/javase/tutorial/java/nutsandbolts/_keywords.html
  var keywords =
    'test|package|inherits|false|import|else|or|class|and|not|native|override|program|this|try|val|var|catch|object|super|throw|if|null|return|true|new|method'

  var buildinConstants = 'null|assert|console'

  var langClasses =
    'Object|Pair|String|Boolean|Number|Integer|Double|Collection|Set|List|Exception|Range' +
    '|StackTraceElement'

  var keywordMapper = this.createKeywordMapper(
    {
      'variable.language': 'this',
      keyword: keywords,
      'constant.language': buildinConstants,
      'support.function': langClasses,
    },
    'identifier'
  )

  // regexp must not have capturing parentheses. Use (?:) instead.
  // regexps are ordered -> the first match is used

  this.$rules = {
    start: [
      {
        token: 'comment',
        regex: '\\/\\/.*$',
      },
      DocCommentHighlightRules.getStartRule('doc-start'),
      {
        token: 'comment', // multi line comment
        regex: '\\/\\*',
        next: 'comment',
      },
      {
        token: 'string', // single line
        regex: '["](?:(?:\\\\.)|(?:[^"\\\\]))*?["]',
      },
      {
        token: 'string', // single line
        regex: "['](?:(?:\\\\.)|(?:[^'\\\\]))*?[']",
      },
      {
        token: 'constant.numeric', // hex
        regex: /0(?:[xX][0-9a-fA-F][0-9a-fA-F_]*|[bB][01][01_]*)[LlSsDdFfYy]?\b/,
      },
      {
        token: 'constant.numeric', // float
        regex: /[+-]?\d[\d_]*(?:(?:\.[\d_]*)?(?:[eE][+-]?[\d_]+)?)?[LlSsDdFfYy]?\b/,
      },
      {
        token: 'constant.language.boolean',
        regex: '(?:true|false)\\b',
      },
      {
        token: keywordMapper,
        // TODO: Unicode escape sequences
        // TODO: Unicode identifiers
        regex: '[a-zA-Z_$][a-zA-Z0-9_$]*\\b',
      },
      {
        token: 'keyword.operator',
        regex:
          '===|&&|\\*=|\\.\\.|\\*\\*|#|!|%|\\*|\\?:|\\+|\\/|,|\\+=|\\-|\\.\\.<|!==|:|\\/=|\\?\\.|\\+\\+|>|=|<|>=|=>|==|\\]|\\[|\\-=|\\->|\\||\\-\\-|<>|!=|%=|\\|',
      },
      {
        token: 'lparen',
        regex: '[[({]',
      },
      {
        token: 'rparen',
        regex: '[\\])}]',
      },
      {
        token: 'text',
        regex: '\\s+',
      },
    ],
    comment: [
      {
        token: 'comment', // closing comment
        regex: '.*?\\*\\/',
        next: 'start',
      },
      {
        token: 'comment', // comment spanning whole line
        regex: '.+',
      },
    ],
  }

  this.embedRules(DocCommentHighlightRules, 'doc-', [
    DocCommentHighlightRules.getEndRule('start'),
  ])
}

oop.inherits(WollokHighlightRules, TextHighlightRules)
