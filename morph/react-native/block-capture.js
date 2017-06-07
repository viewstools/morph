import { hasProp, getProp } from '../utils.js'

export const enter = (node, parent, state) => {
  if (/Capture/.test(node.name.value)) {
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
        state.render(
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
    }
  }
}
