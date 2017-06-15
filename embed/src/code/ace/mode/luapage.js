import * as $_____lib_oop from '../lib/oop'
import * as $____html from './html'
import * as $____lua from './lua'
import * as $____luapage_highlight_rules from './luapage_highlight_rules'

var oop = $_____lib_oop
var HtmlMode = $____html.Mode
var LuaMode = $____lua.Mode
var LuaPageHighlightRules = $____luapage_highlight_rules.LuaPageHighlightRules

export var Mode = function() {
  HtmlMode.call(this)

  this.HighlightRules = LuaPageHighlightRules
  this.createModeDelegates({
    'lua-': LuaMode,
  })
}
oop.inherits(Mode, HtmlMode)
;(function() {
  this.$id = 'ace/mode/luapage'
}.call(Mode.prototype))
