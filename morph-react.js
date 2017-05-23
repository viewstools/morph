import { hasKeys, isCode, isStyle } from './morph-utils.js'
import hash from './hash.js'

export const makeVisitors = ({
  getBlockName,
  getStyleForProperty,
  getValueForProperty,
  isValidPropertyForBlock,
}) => ({
  Block: {
    // TODO Vertical/Horizontal
    // TODO Image
    // TODO Capture*
    // TODO List
    // TODO when
    enter(node, parent, state) {
      const name = getBlockName(node)
      if (name === null) {
        this.skip()
        return
      }
      node.name.finalValue = name

      if (node.name.value === 'List') {
        const from = node.properties.list.find(n => n.key.value === 'from')
        if (!from) return

        if (parent) state.render.push('{')
        state.render.push(`${from.value.value}.map((item, i) => `)
      }

      if (!state.uses.includes(name)) state.uses.push(name)

      state.render.push(`<${name}`)
    },
    leave(node, parent, state) {
      const name = getBlockName(node)

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

      if (node.name.value === 'List') {
        state.render.push(')')
        if (parent) state.render.push(`}`)
      }
    },
  },

  Blocks: {
    enter(node, parent, state) {
      if (node.list.length > 0) state.render.push('>')
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
        const dynamic = wrap(
          Object.keys(node.style.dynamic)
            .map(k => `${JSON.stringify(k)}: ${node.style.dynamic[k]}`)
            .join(',')
        )
        style = style ? `[${style},${dynamic}]` : dynamic
      }

      if (style) {
        state.render.push(` style={${style}}`)
      }

      if (parent.name.value === 'List' && !node.hasKey) {
        state.render.push(' key={i}')
      }
    },
  },

  Property: {
    enter(node, parent, state) {
      if (!isValidPropertyForBlock(node, parent)) return

      const key = node.key.value
      if (isStyle(node)) {
        const code = isCode(node)
        const styleForProperty = getStyleForProperty(node, parent, code)

        Object.assign(
          code ? parent.style.dynamic : parent.style.static,
          styleForProperty
        )
      } else if (key === 'text' && parent.parent.name.value === 'Text') {
        parent.parent.explicitChildren = isCode(node)
          ? wrap(node.value.value)
          : node.value.value
      } else if (!(key === 'from' && parent.parent.name.value === 'List')) {
        const value = getValueForProperty(node, parent)
        state.render.push(` ${key}=${value}`)
      }

      if (parent.parent.name.value === 'List' && key === 'key') {
        parent.hasKey = true
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
