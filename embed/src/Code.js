import { get, fire, set } from './view.js'
import debounce from 'debounce'
import Editor from './code/code.js'
import React from 'react'
import css from 'glam'
import WebFont from 'webfontloader'

const loadFonts = fonts => {
  if (fonts) {
    const families = Object.keys(fonts).map(f => `${f}:${fonts[f].join(',')}`)

    WebFont.load({
      google: {
        families,
      },
    })
  }
}

const morph = message => {
  try {
    console.log('message', message.data.code)
    const fn = new Function('React', 'css', message.data.code)
    console.log(fn)
    const ret = fn(React, css)
    ret({})
    fire(ret)
    loadFonts(message.data.fonts)
  } catch (err) {
    console.error(err)
  }
}

const worker = new Worker('./worker.js')

export default class Code extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      code: get(props.file),
    }
  }

  componentDidMount() {
    worker.addEventListener('message', morph)
  }

  componentWillReceiveProps(next) {
    const { props } = this
    if (props.file !== next.file) {
      this.editor.setValue(get(next.file))
    }
  }

  componentWillUnmount() {
    worker.removeEventListener('message', morph)
  }

  onChange = debounce((changes, editor) => {
    const { file } = this.props
    if (file !== 'view') return

    const text = editor.getValue()

    set(file, text)

    worker.postMessage({
      text,
      options: {
        as: 'react-dom',
        compile: file === 'view',
        inlineStyles: true,
        name: 'View',
        pretty: false,
        tests: false,
      },
    })
  }, 200)

  onLoad = editor => (this.editor = editor)

  render() {
    const { props, state } = this

    return (
      <Editor
        {...props}
        onLoad={this.onLoad}
        onChange={this.onChange}
        value={state.code}
      />
    )
  }
}
