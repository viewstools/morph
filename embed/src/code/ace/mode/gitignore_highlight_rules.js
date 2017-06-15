import * as $_____lib_oop from '../lib/oop'
import * as $____text_highlight_rules from './text_highlight_rules'

var oop = $_____lib_oop
var TextHighlightRules = $____text_highlight_rules.TextHighlightRules

export var GitignoreHighlightRules = function() {
  this.$rules = {
    start: [
      {
        token: 'comment',
        regex: /^\s*#.*$/,
      },
      {
        token: 'keyword', // negated patterns
        regex: /^\s*!.*$/,
      },
    ],
  }

  this.normalizeRules()
}

GitignoreHighlightRules.metaData = {
  fileTypes: ['gitignore'],
  name: 'Gitignore',
}

oop.inherits(GitignoreHighlightRules, TextHighlightRules)
