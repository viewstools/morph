if (typeof process !== 'undefined') {
  $__amd_loader
  $_____test_mockdom
}

import * as $__amd_loader from 'amd-loader'
import * as $_____test_mockdom from '../test/mockdom'
import * as $__assert from 'assert'
import * as $____static_highlight from './static_highlight'
import * as $_____mode_javascript from '../mode/javascript'
import * as $_____mode_text from '../mode/text'
import * as $_____theme_tomorrow from '../theme/tomorrow'
import * as $__asyncjs from 'asyncjs'

var assert = $__assert
var highlighter = $____static_highlight
var JavaScriptMode = $_____mode_javascript.Mode
var TextMode = $_____mode_text.Mode

// Execution ORDER: test.setUpSuite, setUp, testFn, tearDown, test.tearDownSuite
module.exports = {
  timeout: 10000,

  'test simple snippet': function(next) {
    var theme = $_____theme_tomorrow
    var snippet = [
      '/** this is a function',
      '*',
      '*/',
      'function hello (a, b, c) {',
      "    console.log(a * b + c + 'sup$');",
      '}',
    ].join('\n')
    var mode = new JavaScriptMode()

    var result = highlighter.render(snippet, mode, theme)
    assert.equal(
      result.html,
      "<div class='ace-tomorrow'><div class='ace_static_highlight ace_show_gutter' style='counter-reset:ace_line 0'>" +
        "<div class='ace_line'><span class='ace_gutter ace_gutter-cell' unselectable='on'></span><span class='ace_comment ace_doc'>/** this is a function</span>\n</div>" +
        "<div class='ace_line'><span class='ace_gutter ace_gutter-cell' unselectable='on'></span><span class='ace_comment ace_doc'>*</span>\n</div>" +
        "<div class='ace_line'><span class='ace_gutter ace_gutter-cell' unselectable='on'></span><span class='ace_comment ace_doc'>*/</span>\n</div>" +
        "<div class='ace_line'><span class='ace_gutter ace_gutter-cell' unselectable='on'></span><span class='ace_storage ace_type'>function</span> <span class='ace_entity ace_name ace_function'>hello</span> <span class='ace_paren ace_lparen'>(</span><span class='ace_variable ace_parameter'>a</span><span class='ace_punctuation ace_operator'>, </span><span class='ace_variable ace_parameter'>b</span><span class='ace_punctuation ace_operator'>, </span><span class='ace_variable ace_parameter'>c</span><span class='ace_paren ace_rparen'>)</span> <span class='ace_paren ace_lparen'>{</span>\n</div>" +
        "<div class='ace_line'><span class='ace_gutter ace_gutter-cell' unselectable='on'></span>    <span class='ace_storage ace_type'>console</span><span class='ace_punctuation ace_operator'>.</span><span class='ace_support ace_function ace_firebug'>log</span><span class='ace_paren ace_lparen'>(</span><span class='ace_identifier'>a</span> <span class='ace_keyword ace_operator'>*</span> <span class='ace_identifier'>b</span> <span class='ace_keyword ace_operator'>+</span> <span class='ace_identifier'>c</span> <span class='ace_keyword ace_operator'>+</span> <span class='ace_string'>'sup$'</span><span class='ace_paren ace_rparen'>)</span><span class='ace_punctuation ace_operator'>;</span>\n</div>" +
        "<div class='ace_line'><span class='ace_gutter ace_gutter-cell' unselectable='on'></span><span class='ace_paren ace_rparen'>}</span>\n</div>" +
        '</div></div>'
    )
    assert.ok(!!result.css)
    next()
  },

  'test css from theme is used': function(next) {
    var theme = $_____theme_tomorrow
    var snippet = [
      '/** this is a function',
      '*',
      '*/',
      'function hello (a, b, c) {',
      "    console.log(a * b + c + 'sup?');",
      '}',
    ].join('\n')
    var mode = new JavaScriptMode()

    var result = highlighter.render(snippet, mode, theme)

    assert.ok(result.css.indexOf(theme.cssText) !== -1)

    next()
  },

  'test theme classname should be in output html': function(next) {
    var theme = $_____theme_tomorrow
    var snippet = [
      '/** this is a function',
      '*',
      '*/',
      'function hello (a, b, c) {',
      "    console.log(a * b + c + 'sup?');",
      '}',
    ].join('\n')
    var mode = new JavaScriptMode()

    var result = highlighter.render(snippet, mode, theme)
    assert.equal(!!result.html.match(/<div class='ace-tomorrow'>/), true)

    next()
  },

  'test js string replace specials': function(next) {
    var theme = $_____theme_tomorrow
    var snippet = "$'$1$2$$$&"
    var mode = new TextMode()

    var result = highlighter.render(snippet, mode, theme)
    assert.ok(result.html.indexOf(snippet) != -1)

    next()
  },
}

if (typeof module !== 'undefined' && module === require.main) {
  $__asyncjs.test.testcase(module.exports).exec()
}
