// LuaPage implements the LuaPage markup as described by the Kepler Project's CGILua
// documentation: http://keplerproject.github.com/cgilua/manual.html#templates
import * as $_____lib_oop from '../lib/oop'
import * as $____html_highlight_rules from './html_highlight_rules'
import * as $____lua_highlight_rules from './lua_highlight_rules'

var oop = $_____lib_oop
var HtmlHighlightRules = $____html_highlight_rules.HtmlHighlightRules
var LuaHighlightRules = $____lua_highlight_rules.LuaHighlightRules

export var LuaPageHighlightRules = function() {
  HtmlHighlightRules.call(this)

  var startRules = [
    {
      token: 'keyword',
      regex: '<\\%\\=?',
      push: 'lua-start',
    },
    {
      token: 'keyword',
      regex: '<\\?lua\\=?',
      push: 'lua-start',
    },
  ]

  var endRules = [
    {
      token: 'keyword',
      regex: '\\%>',
      next: 'pop',
    },
    {
      token: 'keyword',
      regex: '\\?>',
      next: 'pop',
    },
  ]

  this.embedRules(LuaHighlightRules, 'lua-', endRules, ['start'])

  for (var key in this.$rules)
    this.$rules[key].unshift.apply(this.$rules[key], startRules)

  this.normalizeRules()
}

oop.inherits(LuaPageHighlightRules, HtmlHighlightRules)
