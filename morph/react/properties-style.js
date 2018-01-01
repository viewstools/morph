export function enter(node, parent, state) {
  node.style = {
    dynamic: {
      base: {},
      hover: {},
      focus: {},
      disabled: {},
      placeholder: {},
      print: {},
    },
    static: {
      base: {},
      hover: {},
      focus: {},
      disabled: {},
      placeholder: {},
      print: {},
    },
  }

  // ensure flex-direction in Horizontals
  if (node.isGroup && node.name === 'Horizontal') {
    node.style.static.base.flexDirection = 'row'
  }
}
