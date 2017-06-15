/* global define */

import * as $_____lib_oop from '../lib/oop'
import * as $____html from './html'
import * as $____handlebars_highlight_rules from './handlebars_highlight_rules'
import * as $____behaviour_html from './behaviour/html'
import * as $____folding_html from './folding/html'

var oop = $_____lib_oop
var HtmlMode = $____html.Mode
var HandlebarsHighlightRules =
  $____handlebars_highlight_rules.HandlebarsHighlightRules
var HtmlBehaviour = $____behaviour_html.HtmlBehaviour
var HtmlFoldMode = $____folding_html.FoldMode

export var Mode = function() {
  HtmlMode.call(this)
  this.HighlightRules = HandlebarsHighlightRules
  this.$behaviour = new HtmlBehaviour()
}

oop.inherits(Mode, HtmlMode)
;(function() {
  this.blockComment = { start: '{{!--', end: '--}}' }
  this.$id = 'ace/mode/handlebars'
}.call(Mode.prototype))
