// https://cloud9-sdk.readme.io/docs/highlighting-rules
import { all as COLOR } from 'synesthesia'
import { TextHighlightRules } from '../ace/mode/text_highlight_rules.js'

export default class ViewsHighlightRules extends TextHighlightRules {
  constructor() {
    super()

    this.$rules = {
      start: [
        {
          token: 'comment.todo',
          regex: /^#\s*TODO.+$/,
        },
        {
          token: 'comment.todo',
          regex: /^#\s*todo.+$/,
        },
        {
          token: 'comment',
          regex: /^#.+$/,
        },
        {
          token: 'block.name',
          regex: /^([A-Z][a-zA-Z0-9]*\s*)$/,
        },
        {
          token: 'prop.key.section',
          regex: /^([a-z][a-zA-Z0-9]*\s*)$/,
        },
        {
          token: ['block.name_is', 'block.is', 'block.type'],
          regex: /^([A-Z][a-zA-Z0-9]*)(\s+[a-z\s]*)([A-Z][a-zA-Z0-9]*)\s*$/,
        },
        {
          token: ['prop.key.list', 'space', 'prop.value.type.empty'],
          regex: /^([a-z][a-zA-Z0-9]*)(\s+)(is empty text|is empty list)$/,
        },
        {
          token: [
            'prop.key',
            'space',
            'prop.value.code',
            'prop.value.code.list',
          ],
          regex: /^(from)(\s*)(props\.)([a-z][a-zA-Z0-9]*)$/,
        },
        {
          token: [
            'prop.key',
            'space',
            'prop.value.code.item',
            'prop.value.code',
          ],
          regex: /^([a-z][a-zA-Z0-9]*)(\s*)(item)(.*)$/,
        },
        {
          token: ['prop.key.padding', 'space', 'prop.value'],
          regex: /^(padding[a-zA-Z0-9]*)(\s*)(.+)$/,
        },
        {
          token: ['prop.key.margin', 'space', 'prop.value'],
          regex: /^(margin[a-zA-Z0-9]*)(\s*)(.+)$/,
        },
        {
          token: 'prop.key',
          regex: /^([a-z][a-zA-Z0-9]*)$/,
        },
        {
          token: ['prop.key', 'space'],
          regex: /^([a-z][a-zA-Z0-9]*)(\s+)$/,
        },
        {
          token: ['prop.key', 'space'],
          regex: /^([a-z][a-zA-Z0-9]*)(\s+)/,
          next: 'value',
        },
      ],

      value: [
        {
          // token: ['prop.value', 'prop.value.color'],
          // regex: new RegExp(`(.+?)(${COLOR})`),
          // next: 'start'
          // }, {
          token: v => {
            let ret = 'prop.value'
            if (/(props|item)/.test(v)) {
              ret = `${ret}.code`

              if (/item/.test(v)) {
                ret = `${ret}.item`
              }
            }
            // TODO FIXME, make color work on border
            if (COLOR.test(v) && !/\s/.test(v)) {
              ret = `${ret}.color`
            }
            // console.info('<< v >>', v, COLOR.test(v), ret)
            return ret
          },
          regex: /.+$/,
          next: 'start',
        },
      ],
    }
  }
}
