// https://cloud9-sdk.readme.io/docs/highlighting-rules

import { TextHighlightRules } from '../ace/mode/text_highlight_rules.js'

export default class StatesHighlightRules extends TextHighlightRules {
  constructor() {
    super()

    // regexp must not have capturing parentheses. Use (?:) instead.
    // regexps are ordered -> the first match is used
    this.$rules = {
      start: [
        {
          token: 'space',
          regex: /^(\s+)/,
        },
        {
          token: 'comment',
          regex: /#.+$/,
        },
        {
          token: ['aliases', 'colon'],
          regex: /^(aliases)(:(?:\s*)$)/,
          next: 'start',
        },
        {
          token: ['state', 'colon'],
          regex: /^(\w+)(:(?:\s*)$)/,
        },
        {
          token: ['prop.key.nest', 'prop.colon'],
          regex: /(\w+)(:(?:\s*)$)/,
          next: 'nestedValue',
        },
        {
          token: ['prop.key.inline', 'prop.colon'],
          regex: /(\w+)(:(?:\s+)(?=(?:.+)))/,
          next: 'inlineValue',
        },
        {
          defaultToken: 'text',
        },
      ],

      nestedValue: [
        {
          token: 'prop.value.nest.code',
          regex: /\s*{/,
          next: 'code',
        },
        {
          token: 'prop.value.nest.text', // stop matching text when you find :
          regex: /(?=(?:[^:])*?:)/,
          next: 'start',
        },
        {
          token: 'prop.value.nest.text',
          regex: /.+/,
        },
      ],

      inlineValue: [
        {
          token: 'props.value.code.alias',
          regex: '[&\\*][a-zA-Z0-9-_]+',
        },
        {
          token: 'keyword.operator',
          regex: '<<\\w*:\\w*',
        },
        {
          token: 'prop.value.inline.color.hex',
          regex: /#[a-fA-F0-9]{6}/,
        },
        {
          token: 'prop.value.inline.color.rgb',
          regex: /rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)/,
        },
        {
          token: 'prop.value.inline.color.rgba',
          regex: /rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*[01](\.\d*\s*)?\)/,
        },
        {
          token: 'prop.value.inline.code',
          regex: /({.+})/,
        },
        {
          token: 'prop.value.inline',
          regex: /.*?$/,
          next: 'start',
        },
      ],

      code: [
        {
          token: 'prop.value.nest.code',
          regex: /(.+}$)/,
          next: 'start',
        },
        {
          token: 'prop.value.nest.code',
          regex: /.+/,
        },
      ],
    }
  }
}
