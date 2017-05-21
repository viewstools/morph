export const makeVisitors = ({
  getBlockName,
  getValueForProperty,
  isValidPropertyForBlock,
}) => ({
  Block: {
    enter(node, parent, state) {
      const name = getBlockName(node)
      if (name === null) {
        this.skip()
        return
      }
      node.name.finalValue = name

      if (!state.uses.includes(name)) state.uses.push(name)
      state.render.push(`<${name}`)
    },
    leave(node, parent, state) {
      if (node.blocks && node.blocks.list.length > 0) {
        state.render.push(`</${node.name.finalValue}>`)
      } else {
        state.render.push('/>')
      }
    },
  },

  Blocks: {
    enter(node, parent, state) {
      state.render.push('>')
    },
  },

  Properties: {
    enter(node, parent, state) {},
  },

  Property: {
    enter(node, parent, state) {
      if (!isValidPropertyForBlock(node, parent)) return
      const value = getValueForProperty(node, parent)
      state.render.push(`${node.key.value}=${value}`)
    },
  },

  // Fonts(list) {},

  // Todos(list) {},
})

const wrap = s => `{${s}}`
