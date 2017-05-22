import { hasKeys, isCode, isStyle } from './morph-utils.js'
import hash from './hash.js'

export const makeVisitors = ({
  getBlockName,
  getValueForProperty,
  isValidPropertyForBlock,
}) => ({
  Block: {
    // TODO when
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
      if (node.explicitChildren) {
        state.render.push('>')
        state.render.push(node.explicitChildren)
      }

      if (
        node.explicitChildren ||
        (node.blocks && node.blocks.list.length > 0)
      ) {
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
    enter(node, parent, state) {
      // TODO remap properties, in particular styles
      node.style = {
        dynamic: {},
        static: {},
      }
    },
    leave(node, parent, state) {
      let style = null

      if (hasKeys(node.style.static)) {
        const id = hash(node.style.static)
        state.styles[id] = node.style.static
        parent.styleId = id
        style = `styles.${id}`
      }
      if (hasKeys(node.style.dynamic)) {
        const dynamic = Object.keys(node.style.dynamic)
          .map(k => `${JSON.stringify(k)}: ${node.style.dynamic[k]}`)
          .join(',')
        style = style ? `[${style},{${dynamic}}]` : dynamic
      }

      if (style) {
        state.render.push(`style={${style}}`)
      }
    },
  },

  Property: {
    enter(node, parent, state) {
      if (!isValidPropertyForBlock(node, parent)) return

      const key = node.key.value
      if (isStyle(node)) {
        const value = node.value.value
        if (isCode(node)) {
          parent.style.dynamic[key] = value
        } else {
          parent.style.static[key] = value
        }
      } else if (key === 'text' && parent.parent.name.value === 'Text') {
        parent.parent.explicitChildren = isCode(node)
          ? wrap(node.value.value)
          : node.value.value
      } else {
        const value = getValueForProperty(node, parent)
        state.render.push(`${key}=${value}`)
      }
    },
  },

  Fonts(list, state) {
    state.fonts = list
  },

  Todos(list, state) {
    state.todos = list
  },
})

export const wrap = s => `{${s}}`
