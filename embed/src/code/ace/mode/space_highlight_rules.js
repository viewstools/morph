import * as $_____lib_oop from '../lib/oop'
import * as $____text_highlight_rules from './text_highlight_rules'

var oop = $_____lib_oop
var TextHighlightRules = $____text_highlight_rules.TextHighlightRules

export var SpaceHighlightRules = function() {
  // Todo: support multiline values that escape the newline with spaces.
  this.$rules = {
    start: [
      {
        token: 'empty_line',
        regex: / */,
        next: 'key',
      },
      {
        token: 'empty_line',
        regex: /$/,
        next: 'key',
      },
    ],
    key: [
      {
        token: 'variable',
        regex: /\S+/,
      },
      {
        token: 'empty_line',
        regex: /$/,
        next: 'start',
      },
      {
        token: 'keyword.operator',
        regex: / /,
        next: 'value',
      },
    ],
    value: [
      {
        token: 'keyword.operator',
        regex: /$/,
        next: 'start',
      },
      {
        token: 'string',
        regex: /[^$]/,
      },
    ],
  }
}

oop.inherits(SpaceHighlightRules, TextHighlightRules)
