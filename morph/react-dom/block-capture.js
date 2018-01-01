import { getProp } from '../utils.js'
import toCamelCase from 'to-camel-case'

const typesMap = {
  CaptureEmail: 'email',
  CaptureText: 'text',
  CaptureNumber: 'number',
  CapturePhone: 'tel',
  CaptureSecure: 'password',
}

export const enter = (node, parent, state) => {
  const blockType = node.name

  if (!/Capture/.test(blockType)) return

  node.isCapture = true

  const name = toCamelCase(node.is || blockType)
  state.captures.push(name)

  if (typesMap[blockType]) {
    state.render.push(` type='${typesMap[blockType]}'`)
  }

  // if you specify a value, then you're supposed to manage the input from
  // outside the view
  if (getProp(node, 'value')) return

  state.render.push(
    ` onChange={event => this.setState({ ${name}: event.target.value })}`
  )
  state.render.push(` value={state.${name}}`)

  if (state.debug) {
    state.render.push(` tabIndex={-1}`)
  }
}
