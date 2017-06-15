if (typeof process !== 'undefined') {
  $__amd_loader
  $_____test_mockdom
}

import * as $__amd_loader from 'amd-loader'
import * as $_____test_mockdom from '../test/mockdom'
import * as $__assert from 'assert'
import * as $_____edit_session from '../edit_session'
import * as $____whitespace from './whitespace'
import * as $__asyncjs from 'asyncjs'

var assert = $__assert
var EditSession = $_____edit_session.EditSession
var whitespace = $____whitespace

// Execution ORDER: test.setUpSuite, setUp, testFn, tearDown, test.tearDownSuite
module.exports = {
  timeout: 10000,

  'test tab detection': function(next) {
    var s = new EditSession([
      'define({',
      '\tfoo:1,',
      '\tbar:2,',
      '\tbaz:{,',
      '\t\tx:3',
      '\t}',
      '})',
    ])

    var indent = whitespace.$detectIndentation(s.doc.$lines)
    assert.equal(indent.ch, '\t')
    assert.equal(indent.length, undefined)

    s.insert({ row: 0, column: 0 }, '  ')
    indent = whitespace.$detectIndentation(s.doc.$lines)
    assert.equal(indent.ch, '\t')
    assert.equal(indent.length, undefined)
    s.doc.removeInLine(0, 0, 2)

    s.insert({ row: 0, column: 0 }, 'x\n    y\n        z\n')
    indent = whitespace.$detectIndentation(s.doc.$lines)
    assert.equal(indent.ch, '\t')
    assert.equal(indent.length, 4)

    s.setValue('')
    indent = whitespace.$detectIndentation(s.doc.$lines)
    assert.ok(!indent)

    next()
  },

  'test empty session': function(next) {
    var s = new EditSession(['define({', 'foo:1,', '})'])
    var indent = whitespace.$detectIndentation(s.doc.$lines)
    assert.ok(!indent)
    s.insert({ row: 1, column: 0 }, '    x\n    ')

    indent = whitespace.$detectIndentation(s.doc.$lines)
    assert.equal(indent.ch, ' ')
    assert.equal(indent.length, 4)

    next()
  },

  '!test one line': function(next) {
    var s = new EditSession(['define({', '    foo:1,', '})'])
    var indent = whitespace.$detectIndentation(s.doc.$lines)
    assert.equal(indent.ch, ' ')
    assert.equal(indent.length, 4)

    next()
  },

  'test 1 width indents': function(next) {
    var s = new EditSession([
      'define({',
      '    foo:1,',
      '})',
      'define({',
      '    bar:1,',
      '})',
      '     t',
      '      t',
      '     t',
      '      t',
      '     t',
      '      t',
      '     t',
      '      t',
    ])
    var indent = whitespace.$detectIndentation(s.doc.$lines)
    // assert.equal(indent.ch, " ");
    // assert.equal(indent.length, 4);

    s = new EditSession(['{', ' foo:1,', ' bar: {', '  baz:2', ' }', '}'])
    indent = whitespace.$detectIndentation(s.doc.$lines)
    assert.equal(indent.ch, ' ')
    assert.equal(indent.length, 1)

    next()
  },
}

if (typeof module !== 'undefined' && module === require.main) {
  $__asyncjs.test.testcase(module.exports).exec()
}
