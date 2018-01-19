import { getProp } from '../utils.js'
import safe from '../react/safe.js'
import toCamelCase from 'to-camel-case'

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

  const name = toCamelCase(node.is || blockType)
  state.captures.push(name)

  const { captureNext } = node
  let onSubmit = getProp(node, 'onSubmit') || null
  if (onSubmit) onSubmit = onSubmit.value.value

  if (captureNext) {
    state.render.push(` blurOnSubmit={false}`)
    state.render.push(
      ` onSubmitEditing={this.$${captureNext}? () => this.$${captureNext}.focus() : ${onSubmit}}`
    )
    state.render.push(` returnKeyType = {this.$${captureNext}? 'next' : 'go'}`)
  } else {
    if (onSubmit) {
      state.render.push(` onSubmitEditing={${onSubmit}}`)
      state.render.push(` returnKeyType="go"`)
    } else {
      state.render.push(` returnKeyType="done"`)
    }
  }
  state.render.push(` onChangeText = {${name} => this.setState({ ${name} })}`)
  state.render.push(` ref={$e => this.$${name} = $e}`)
  state.render.push(` value={state.${name}}`)

  if (node.name === 'CaptureSecure') {
    state.render.push(` secureTextEntry`)
  } else {
    state.render.push(` keyboardType='${keyboardType[blockType]}'`)
  }

  if (node.name === 'CaptureTextArea') {
    state.render.push(` multiline={true}`)
  }

  // TODO rest of props
  const onBlur = getProp(node, 'onBlur')
  if (onBlur) {
    state.render.push(` onBlur=${safe(onBlur.value.value)}`)
  }

  const onFocus = getProp(node, 'onFocus')
  if (onFocus) {
    state.render.push(` onFocus=${safe(onFocus.value.value)}`)
  }

  const autoCorrect = getProp(node, 'autoCorrect')
  state.render.push(
    ` autoCorrect=${autoCorrect ? safe(autoCorrect.value.value) : '{false}'}`
  )

  const placeholder = getProp(node, 'placeholder')
  if (placeholder) {
    state.render.push(` placeholder=${safe(placeholder.value.value)}`)
  }

  const defaultValue = getProp(node, 'defaultValue')
  if (defaultValue) {
    state.render.push(` defaultValue=${safe(defaultValue.value.value)}`)
  }

  const underlineColorAndroid = getProp(node, 'underlineColorAndroid')
  const underlineColorAndroidValue = underlineColorAndroid
    ? underlineColorAndroid.value.value
    : 'transparent'
  state.render.push(
    ` underlineColorAndroid=${safe(underlineColorAndroidValue)}`
  )
}
