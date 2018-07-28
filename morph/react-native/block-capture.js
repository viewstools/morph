import { getProp } from '../utils.js'

const keyboardType = {
  CaptureEmail: 'email-address',
  CaptureText: 'default',
  CaptureTextArea: 'default',
  CaptureNumber: 'numeric',
  CapturePhone: 'phone-pad',
}

export const enter = (node, parent, state) => {
  const blockType = node.name

  if (!/Capture/.test(node.name)) return
  node.isCapture = true

  if (node.name === 'CaptureSecure') {
    state.render.push(` secureTextEntry`)
  } else {
    state.render.push(` keyboardType='${keyboardType[blockType]}'`)
  }

  if (node.name === 'CaptureTextArea') {
    state.render.push(` multiline={true}`)
  }

  const autoCorrect = getProp(node, 'autoCorrect')
  if (!autoCorrect) {
    state.render.push(` autoCorrect={false}`)
  }

  const underlineColorAndroid = getProp(node, 'underlineColorAndroid')
  if (!underlineColorAndroid) {
    state.render.push(` underlineColorAndroid="transparent"`)
  }

  const textAlignVertical = getProp(node, 'textAlignVertical')
  if (!textAlignVertical) {
    state.render.push(` textAlignVertical="top"`)
  }
}
