// created with https://ace.c9.io/tool/mode_creator.html
// more https://github.com/ajaxorg/ace/wiki/Creating-or-Extending-an-Edit-Mode
import { MatchingBraceOutdent } from '../ace/mode/matching_brace_outdent.js'
import { Mode as TextMode } from '../ace/mode/text.js'
import { FoldMode } from '../ace/mode/folding/coffee.js'
// import StatesHighlightRules from './states-highlight-rules.js'
import ViewsHighlightRules from './views-highlight-rules.js'

export default class YamlMode extends TextMode {
  constructor() {
    super()

    this.foldingRules = new FoldMode()

    this.HighlightRules = ViewsHighlightRules
    this.$id = 'ace/mode/views-yaml'
    this.$outdent = new MatchingBraceOutdent()

    this.lineCommentStart = '#'
  }
}
