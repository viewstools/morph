import { setCompleters } from './ace/ext/language_tools.js'
// import { snippetManager } from './ace/ext/language_tools.js'
import { edit } from './ace/ace.js'
import { PropTypes, PureComponent } from 'react'
import React from 'react'
// import { trigger } from './shortcut.js'
import './code/style.css'
import ViewsMode from './code/views-mode.js'

const trigger = () => {}

const convertKey = k => `${k[0].toUpperCase()}${k.substr(1).replace(/-/g, '+')}`

export default class CodeEditor extends PureComponent {
  componentDidMount() {
    const { props } = this

    const editor = (this.editor = edit(props.file))
    const session = editor.getSession()

    editor.$blockScrolling = Infinity
    // editor.commands.on('afterExec', props.onCommandsAfterExec)
    // editor.on('click', props.onClick)
    editor.on('change', props.onChange)
    // editor.on('changeSelection', props.onChangeSelection)
    // editor.on('paste', props.onPaste)
    // snippetManager.insertSnippet(editor, )
    editor.setFontSize(props.fontSize)
    editor.setOptions({
      enableBasicAutocompletion: props.enableBasicAutocompletion,
      readOnly: props.readOnly,
      scrollPastEnd: true,
      tabSize: props.tabSize,
      useSoftTabs: true,
    })
    editor.setHighlightActiveLine(props.highlightActiveLine)
    editor.setShowPrintMargin(props.showPrintMargin)
    editor.setValue(props.value, props.cursorStart)
    editor.renderer.setShowGutter(props.showGutter)
    editor.renderer.$textLayer.onRenderLine = props.onRenderLine

    // session.on('tokenizerUpdate', props.onTokenizerUpdate)
    session.setMode(
      typeof props.mode === 'string' ? `ace/mode/${props.mode}` : props.mode
    )
    session.setUseWrapMode(props.wrapEnabled)

    if (props.getCompletions) {
      setCompleters([
        {
          getCompletions: props.getCompletions,
        },
      ])
    }

    if (typeof props.onLoad === 'function') {
      props.onLoad(editor)
    }

    // props.bypassShortcuts.forEach(keys => {
    //   editor.commands.addCommand({
    //     bindKey: { mac: convertKey(keys[0]), win: convertKey(keys[1]) },
    //     exec: () => trigger(keys[0]),
    //     name: keys[0],
    //     readOnly: false,
    //   })
    // })
    // props.shortcuts.forEach(({ keys, onPress: exec }) => {
    //   editor.commands.addCommand({
    //     bindKey: { mac: convertKey(keys[0]), win: convertKey(keys[1]) },
    //     exec,
    //     name: keys[0],
    //     readOnly: false,
    //   })
    // })
  }

  componentDidUpdate(prevProps) {
    const { editor, props } = this

    if (prevProps.readOnly !== props.readOnly) {
      editor.setOptions({
        readOnly: props.readOnly,
      })
    }
  }

  componentWillUnmount() {
    this.editor.destroy()
  }

  render() {
    const { props } = this

    return (
      <div
        className="editor-view"
        id={props.file}
        style={{ height: props.height, width: props.width }}
      />
    )
  }
}
CodeEditor.defaultProps = {
  cursorStart: -1,
  enableBasicAutocompletion: true,
  fontSize: 14,
  highlightActiveLine: false,
  mode: new ViewsMode(),
  showGutter: true,
  showPrintMargin: false,
  tabSize: 2,
  value: '',
  wrap: 80,
  wrapEnabled: true,
}
// CodeEditor.propTypes = {
//   bypassShortcuts: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
//   cursorStart: PropTypes.number,
//   enableBasicAutocompletion: PropTypes.bool,
//   fontSize: PropTypes.number,
//   getCompletions: PropTypes.func,
//   highlightActiveLine: PropTypes.bool,
//   id: PropTypes.string,
//   mode: PropTypes.any,
//   onClick: PropTypes.func,
//   onChange: PropTypes.func,
//   onChangeSelection: PropTypes.func,
//   onLoad: PropTypes.func,
//   onTokenizerUpdate: PropTypes.func,
//   shortcuts: PropTypes.arrayOf(
//     PropTypes.shape({
//       keys: PropTypes.arrayOf(PropTypes.string),
//       onPress: PropTypes.func,
//     })
//   ),
//   showGutter: PropTypes.bool,
//   showPrintMargin: PropTypes.bool,
//   tabSize: PropTypes.number,
//   // theme: PropTypes.string,
//   value: PropTypes.string,
//   wrap: PropTypes.number,
//   wrapEnabled: PropTypes.bool,
// }

//   getCommandsFor(tab) {
//     let commands = [{
//       bindKey: { win: 'Ctrl-D', mac: 'Command-D' },
//       exec: () => Mousetrap.trigger('command+d'),
//       name: 'ash',
//       readOnly: false
//     }]

//     if (tab === PAGE || tab === STATES) {
//       commands.push({
//         name: 'removeline',
//         bindKey: { win: 'Ctrl-Shift-X', mac: 'Command-Shift-X'},
//         exec: editor => { editor.removeLines() },
//         scrollIntoView: 'cursor',
//         multiSelectAction: 'forEachLine'
//       })
//     }
