import { getProp, isSlot } from '../utils.js'
import safe from '../react/safe.js'

let typesMap = {
  email: 'email',
  text: 'text',
  number: 'number',
  phone: 'tel',
  secure: 'password',
  file: 'file',
}

let maskFormats = {
  creditCard: `[/\\d/, /\\d/, /\\d/, /\\d/, ' ', /\\d/, /\\d/, /\\d/, /\\d/, ' ', /\\d/, /\\d/, /\\d/, /\\d/, ' ', /\\d/, /\\d/, /\\d/, /\\d/]`,
  date: `[/\\d/, /\\d/, '/', /\\d/, /\\d/, '/', /\\d/, /\\d/, /\\d/, /\\d/]`,
  phoneUS: `['(', /[1-9]/, /\\d/, /\\d/, ')', ' ', /\\d/, /\\d/, /\\d/, '-', /\\d/, /\\d/, /\\d/, /\\d/]`,
}

export let enter = (node, parent, state) => {
  if (!node.isCapture || node.name === 'CaptureTextArea') return

  let type = getProp(node, 'type')
  let mask = getProp(node, 'mask')

  if (mask) {
    state.captureMasks[node.id] = maskFormats[mask.value]
    state.render.push(` ref={input${node.id}} onChange={onChange${node.id}}`)
    node.properties = node.properties.filter(prop => prop.name !== 'mask')
    type.value =
      type.value === 'number' || type.value === 'email' ? 'text' : type.value
  }

  if (isSlot(type)) {
    state.render.push(` type=${safe(type.value)}`)

    // fix for iOS Safari to show the numpad on
    // http://danielfriesen.name/blog/2013/09/19/input-type-number-and-ios-numeric-keypad/
    let maybeNumber = (name, valueWhenTrue) =>
      `${name}={${type.value} === 'number' || ${
        type.value
      } === 'phone'? "${valueWhenTrue}" : undefined}`
    state.render.push(maybeNumber('inputMode', 'numeric'))
    state.render.push(maybeNumber('pattern', '[0-9]*'))
  } else {
    state.render.push(` type=${safe(typesMap[type.value])}`)

    // fix for iOS Safari to show the numpad on
    // http://danielfriesen.name/blog/2013/09/19/input-type-number-and-ios-numeric-keypad/
    if (type.value === 'number' || type.value === 'phone') {
      state.render.push(` inputMode="numeric" pattern="[0-9]*"`)
    }
  }
}
