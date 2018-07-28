const typesMap = {
  CaptureEmail: 'email',
  CaptureText: 'text',
  CaptureNumber: 'number',
  CapturePhone: 'tel',
  CaptureSecure: 'password',
}

export const enter = (node, parent, state) => {
  if (!/Capture/.test(node.name)) return

  node.isCapture = true

  if (typesMap[node.name]) {
    state.render.push(` type='${typesMap[node.name]}'`)
  }

  // fix for iOS Safari to show the numpad on
  // http://danielfriesen.name/blog/2013/09/19/input-type-number-and-ios-numeric-keypad/
  if (node.name === 'CaptureNumber') {
    state.render.push(` inputMode="numeric" pattern="[0-9]*"`)
  }
}
