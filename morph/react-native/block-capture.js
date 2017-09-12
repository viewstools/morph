import { hasProp, getProp } from '../utils.js'
import safe from '../react/safe.js'

const keyboardType = {
  CaptureEmail: 'email-address',
  CaptureText: 'default',
  CaptureNumber: 'numeric',
  CapturePhone: 'phone-pad',
}

export const enter = (node, parent, state) => {
  if (/Capture/.test(node.name.value)) {
    state.captures.push(node.is || node.name.value)

    if (node.properties && !hasProp(node, 'ref')) {
      node.properties.skip = true

      const { captureNext } = node
      let onSubmit = getProp(node, 'onSubmit') || null
      if (onSubmit) onSubmit = onSubmit.value.value

      if (captureNext) {
        state.render.push(` blurOnSubmit={false}`)
        state.render.push(
          ` onSubmitEditing={this.$capture${captureNext}? () => this.$capture${captureNext}.focus() : ${onSubmit}}`
        )
        state.render.push(
          ` returnKeyType = {this.$capture${captureNext}? 'next' : 'go'}`
        )
      } else {
        if (onSubmit) {
          state.render.push(` onSubmitEditing={${onSubmit}}`)
          state.render.push(` returnKeyType="go"`)
        } else {
          state.render.push(` returnKeyType="done"`)
        }
      }
      state.render.push(
        ` onChangeText = {${node.is} => this.setState({ ${node.is} })}`
      )
      state.render.push(` ref={$e => this.$capture${node.is} = $e}`)
      state.render.push(` value={state.${node.is}}`)

      if (node.name.value === 'CaptureSecure') {
        state.render.push(` secureTextEntry`)
      } else {
        state.render.push(` keyboardType='${keyboardType[node.name.value]}'`)
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

      const placeholder = getProp(node, 'placeholder')
      if (placeholder) {
        state.render.push(` placeholder=${safe(placeholder.value.value)}`)
      }

      const underlineColorAndroid = getProp(node, 'underlineColorAndroid')
      const underlineColorAndroidValue = underlineColorAndroid
        ? underlineColorAndroid.value.value
        : 'transparent'
      state.render.push(
        ` underlineColorAndroid=${safe(underlineColorAndroidValue)}`
      )
    }
  }
}
