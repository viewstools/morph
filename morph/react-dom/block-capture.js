import { hasProp, getProp } from '../utils.js'
import safe from '../react/safe.js'

const type = {
  CaptureEmail: 'email',
  CaptureText: 'text',
  CaptureNumber: 'number',
  CapturePhone: 'tel',
  CaptureSecure: 'password',
}

// TODO textarea
export const enter = (node, parent, state) => {
  if (!/Capture/.test(node.name.value)) return

  state.captures.push(node.is || node.name.value)

  if (node.properties && !hasProp(node, 'ref')) {
    node.properties.skip = true

    // const { captureNext } = node
    let onSubmit = getProp(node, 'onSubmit') || null
    if (onSubmit) onSubmit = onSubmit.value.value

    // if (captureNext) {
    //   state.render.push(` blurOnSubmit={false}`)
    //   state.render.push(
    //     ` onSubmitEditing={this.$capture${captureNext}? () => this.$capture${captureNext}.focus() : ${onSubmit}}`
    //   )
    //   state.render.push(
    //     ` returnKeyType = {this.$capture${captureNext}? 'next' : 'go'}`
    //   )
    // } else {
    //   if (onSubmit) {
    //     state.render.push(` onSubmitEditing={${onSubmit}}`)
    //     state.render.push(` returnKeyType="go"`)
    //   } else {
    //     state.render.push(` returnKeyType="done"`)
    //   }
    // }
    state.render.push(
      ` onChange={event => this.setState({ ${node.is}: event.target.value })}`
    )
    // state.render.push(` ref={$e => this.$capture${node.is} = $e}`)
    // TODO value to default state
    const value = getProp(node, 'value')
    state.render.push(` value={state.${node.is}}`)

    state.render.push(` type='${type[node.name.value]}'`)

    // TODO rest of props
    const onBlur = getProp(node, 'onBlur')
    if (onBlur) {
      state.render.push(` onBlur=${safe(onBlur.value.value)}`)
    }

    const onFocus = getProp(node, 'onFocus')
    if (onFocus) {
      state.render.push(` onFocus=${safe(onFocus.value.value)}`)
    }

    // const autoCorrect = getProp(node, 'autoCorrect')
    // state.render.push(
    //   ` autoCorrect=${autoCorrect ? safe(autoCorrect.value.value) : '{false}'}`
    // )

    const placeholder = getProp(node, 'placeholder')
    if (placeholder) {
      state.render.push(` placeholder=${safe(placeholder.value.value)}`)
    }

    // const underlineColorAndroid = getProp(node, 'underlineColorAndroid')
    // const underlineColorAndroidValue = underlineColorAndroid
    //   ? underlineColorAndroid.value.value
    //   : 'transparent'
    // state.render.push(
    //   ` underlineColorAndroid=${safe(underlineColorAndroidValue)}`
    // )
  }
}
