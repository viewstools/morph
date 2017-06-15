/* global define */

import * as $_____lib_oop from '../lib/oop'
import * as $____html_highlight_rules from './html_highlight_rules'

var oop = $_____lib_oop
var HtmlHighlightRules = $____html_highlight_rules.HtmlHighlightRules

function pop2(currentState, stack) {
  stack.splice(0, 3)
  return stack.shift() || 'start'
}
export var HandlebarsHighlightRules = function() {
  HtmlHighlightRules.call(this)
  var hbs = {
    regex: '(?={{)',
    push: 'handlebars',
  }
  for (var key in this.$rules) {
    this.$rules[key].unshift(hbs)
  }
  this.$rules.handlebars = [
    {
      token: 'comment.start',
      regex: '{{!--',
      push: [
        {
          token: 'comment.end',
          regex: '--}}',
          next: pop2,
        },
        {
          defaultToken: 'comment',
        },
      ],
    },
    {
      token: 'comment.start',
      regex: '{{!',
      push: [
        {
          token: 'comment.end',
          regex: '}}',
          next: pop2,
        },
        {
          defaultToken: 'comment',
        },
      ],
    },
    {
      token: 'support.function', // unescaped variable
      regex: '{{{',
      push: [
        {
          token: 'support.function',
          regex: '}}}',
          next: pop2,
        },
        {
          token: 'variable.parameter',
          regex: '[a-zA-Z_$][a-zA-Z0-9_$]*',
        },
      ],
    },
    {
      token: 'storage.type.start', // begin section
      regex: '{{[#\\^/&]?',
      push: [
        {
          token: 'storage.type.end',
          regex: '}}',
          next: pop2,
        },
        {
          token: 'variable.parameter',
          regex: '[a-zA-Z_$][a-zA-Z0-9_$]*',
        },
      ],
    },
  ]

  this.normalizeRules()
}

oop.inherits(HandlebarsHighlightRules, HtmlHighlightRules)
