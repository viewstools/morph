import { extractCode } from './code.js'
import morphBlock from './morph-block.js'
import morphProps from './morph-props.js'

function* Capture({ blockIs, captureNext, onSubmit, styleActive, styleActiveHover, styleHover, stylePlaceholder, ...props }, { block, custom, debug, indent, index }) {
  const uses = ['TextInput']
  let nextIndex = index + 1

  if (!props.ref) {
    if (captureNext) {
      props.blurOnSubmit = '{false}'
      props.onSubmitEditing = `{this.$capture${captureNext}? () => this.$capture${captureNext}.focus() : ${extractCode(onSubmit).code}}`
      props.returnKeyType = `{this.$capture${captureNext}? 'next' : 'go'}`
    } else {
      if (onSubmit) {
        props.onSubmitEditing = onSubmit
        props.returnKeyType = 'go'
      } else {
        props.returnKeyType = 'done'
      }
    }
    props.onChangeText = `{${blockIs} => this.setState({ ${blockIs} })}`
    props.ref = `{$e => this.$capture${blockIs} = $e}`
    props.value = `{state.${blockIs}}`
  }

  yield `${indent}<TextInput`
  const { accessed, hasProps } = yield* morphProps({
    ...props,
    placeholderTextColor: stylePlaceholder? stylePlaceholder.color : undefined,
  }, { block, debug, indent: `${indent}  `, index })
  if (hasProps) yield indent
  yield `/>\n`

  return {
    accessed,
    captures: [blockIs],
    index: nextIndex,
    uses,
  }
}

export function* CaptureEmail(props, options) {
  return yield* Capture({
    ...props,
    autoCapitalize: 'none',
    autoCorrect: false,
    keyboardType: 'email-address',
  }, options)
}

export function* CaptureInput(props, options) {
  return yield* Capture({
    ...props,
    keyboardType: 'default',
  }, options)
}

export function* CaptureNumber(props, options) {
  return yield* Capture({
    ...props,
    keyboardType: 'numeric',
  }, options)
}

export function* CapturePhone(props, options) {
  return yield* Capture({
    ...props,
    keyboardType: 'phone-pad',
  }, options)
}

export function* CaptureSecure(props, options) {
  return yield* Capture({
    ...props,
    secureTextEntry: true,
  }, options)
}

export function* CaptureText(props, options) {
  // TODO textarea
  return {
    accessed: [],
    index: options.index,
    uses: [],
  }
}
