import { getProp, isSlot } from '../utils.js'

let keyboardType = {
  email: 'email-address',
  number: 'numeric',
  phone: 'phone-pad',
}

export let enter = (node, parent, state) => {
  if (!node.isCapture) return

  node.properties = node.properties.filter(prop => prop.name !== 'mask')

  if (node.name === 'CaptureTextArea') {
    state.render.push(` multiline={true}`)
  } else {
    let type = getProp(node, 'type')

    // TODO warn on parser
    // TODO support file upload in RN
    if (type.value === 'file') {
      type.value = 'text'
    }

    if (type.value === 'secure') {
      state.render.push(` secureTextEntry`)
    } else {
      if (isSlot(type)) {
        let dynamicKeyboardType = `
          ${type.value} === 'email'?
            '${keyboardType.email}' :
              ${type.value} === 'number'?
                '${keyboardType.number}' :
                ${type.value} === 'phone'?
                  '${keyboardType.phone}' : 'default'
        `
        state.render.push(` keyboardType={${dynamicKeyboardType}}`)
      } else if (keyboardType[type.value]) {
        state.render.push(` keyboardType='${keyboardType[type.value]}'`)
      }
    }
  }

  let autoCorrect = getProp(node, 'autoCorrect')
  if (!autoCorrect) {
    state.render.push(` autoCorrect={false}`)
  }

  let underlineColorAndroid = getProp(node, 'underlineColorAndroid')
  if (!underlineColorAndroid) {
    state.render.push(` underlineColorAndroid="transparent"`)
  }

  let textAlignVertical = getProp(node, 'textAlignVertical')
  if (!textAlignVertical) {
    state.render.push(` textAlignVertical="top"`)
  }
}
