import { getProp, hasKeys, isCode, isStyle } from './morph-utils.js'

export const makeVisitors = ({
  getBlockName,
  getStyleForProperty,
  getValueForProperty,
  isValidPropertyForBlock,
  PropertiesStyleLeave,
}) => {
  const BlockName = {
    enter(node, parent, state) {
      const name = getBlockName(node)
      if (name === null) return this.skip()

      node.name.finalValue = name
      if (!state.uses.includes(name) && !/props/.test(name))
        state.uses.push(name)

      state.render.push(`<${name}`)
    },
    leave(node, parent, state) {
      if (
        node.explicitChildren ||
        (node.blocks && node.blocks.list.length > 0)
      ) {
        state.render.push(`</${node.name.finalValue}>`)
      } else {
        state.render.push('/>')
      }
    },
  }

  const BlockWhen = {
    enter(node, parent, state) {
      // when lets you show/hide blocks depending on props
      const when = getProp(node, 'when')
      if (when) {
        node.when = true

        if (parent) state.render.push('{')
        state.render.push(`${when.value.value} ? `)
      }
    },
    leave(node, parent, state) {
      if (node.when) {
        state.render.push(` : null`)
        if (parent) state.render.push('}')
      }
    },
  }

  const BlockExplicitChildren = {
    leave(node, parent, state) {
      if (node.explicitChildren) {
        state.render.push('>')
        state.render.push(node.explicitChildren)
      }
    },
  }

  const BlocksList = {
    enter(node, parent, state) {
      if (parent.name.value === 'List') {
        const from = getProp(parent, 'from')
        if (!from) return

        state.render.push(`{${from.value.value}.map((item, i) => `)

        node.list.forEach(n => (n.isInList = true))
      }
    },
    leave(node, parent, state) {
      if (parent.name.value === 'List') {
        state.render.push(')}')
      }
    },
  }

  const PropertiesListKey = {
    leave(node, parent, state) {
      if (parent.isInList && !node.hasKey) {
        state.render.push(' key={i}')
      }
    },
  }

  const PropertiesStyle = {
    enter(node, parent, state) {
      node.style = {
        dynamic: {},
        static: {},
      }

      const name = parent.name.value
      if (name === 'Vertical' || name === 'List') {
        node.style.static.flexDirection = 'column'
      } else if (name === 'Horizontal') {
        node.style.static.flexDirection = 'row'
      }
    },
    leave: PropertiesStyleLeave,
  }

  const PropertyList = {
    enter(node, parent, state) {
      // block is inside List
      if (parent.isInList === 'List' && node.key.value === 'key') {
        parent.hasKey = true
      }
    },
  }

  const PropertyRest = {
    enter(node, parent, state) {
      if (
        !parent.skip &&
        !(node.key.value === 'from' && parent.parent.name.value === 'List')
      ) {
        const value = getValueForProperty(node, parent)

        if (value) {
          Object.keys(value).forEach(k =>
            state.render.push(` ${k}=${value[k]}`)
          )
        }
      }
    },
  }

  const PropertyStyle = {
    enter(node, parent, state) {
      if (isStyle(node) && parent.parent.isBasic) {
        const code = isCode(node)
        const { _isProp, ...styleForProperty } = getStyleForProperty(
          node,
          parent,
          code
        )

        if (_isProp) {
          Object.keys(styleForProperty).forEach(k =>
            state.render.push(` ${k}=${safe(styleForProperty[k], node)}`)
          )
        } else {
          Object.assign(
            code ? parent.style.dynamic : parent.style.static,
            styleForProperty
          )
        }

        return true
      }
    },
  }

  const PropertyText = {
    enter(node, parent, state) {
      if (node.key.value === 'text' && parent.parent.name.value === 'Text') {
        parent.parent.explicitChildren = isCode(node)
          ? wrap(node.value.value)
          : node.value.value

        return true
      }
    },
  }

  return {
    Block: {
      // TODO Image
      // TODO Capture*
      // TODO List without wrapper?
      enter(node, parent, state) {
        BlockWhen.enter.call(this, node, parent, state)
        BlockName.enter.call(this, node, parent, state)
      },
      leave(node, parent, state) {
        BlockExplicitChildren.leave.call(this, node, parent, state)
        BlockName.leave.call(this, node, parent, state)
        BlockWhen.leave.call(this, node, parent, state)
      },
    },

    Blocks: {
      enter(node, parent, state) {
        if (node.list.length > 0) state.render.push('>')
        BlocksList.enter.call(this, node, parent, state)
      },
      leave(node, parent, state) {
        BlocksList.leave.call(this, node, parent, state)
      },
    },

    Properties: {
      enter(node, parent, state) {
        PropertiesStyle.enter.call(this, node, parent, state)
      },
      leave(node, parent, state) {
        PropertiesStyle.leave.call(this, node, parent, state)
        PropertiesListKey.leave.call(this, node, parent, state)
      },
    },

    Property: {
      enter(node, parent, state) {
        if (node.key.value === 'when') return
        if (!isValidPropertyForBlock(node, parent)) return

        if (PropertyStyle.enter.call(this, node, parent, state)) return
        if (PropertyText.enter.call(this, node, parent, state)) return
        PropertyList.enter.call(this, node, parent, state)
        PropertyRest.enter.call(this, node, parent, state)
      },
    },

    Fonts(list, state) {
      state.fonts = list
    },

    Todos(list, state) {
      state.todos = list
    },
  }
}

export const safe = (value, node) =>
  typeof value === 'string' && !isCode(node)
    ? JSON.stringify(value)
    : wrap(value)

export const wrap = s => `{${s}}`
