import {
  getProp,
  getStyleType,
  isCode,
  isData,
  isStyle,
  isToggle,
} from './morph-utils.js'
import getBody from './react-native/get-body.js'
import getDefaultProps from './react-native/get-default-props.js'
import getDependencies from './react-native/get-dependencies.js'
import toCamelCase from 'to-camel-case'
import toPascalCase from 'to-pascal-case'

export const makeVisitors = ({
  getBlockName,
  getStyleForProperty,
  getValueForProperty,
  isValidPropertyForBlock,
  PropertiesStyleLeave,
}) => {
  const BlockDefaultProps = {
    enter(node, parent, state) {
      if (parent || node.name.value === 'List') return

      const from = getProp(node, 'from')
      if (from && isData(from)) {
        state.use(from.value.value)
        state.defaultProps = toCamelCase(from.value.value)
      }
    },
  }

  const BlockName = {
    enter(node, parent, state) {
      const name = getBlockName(node, state)
      if (name === null) return this.skip()

      node.name.finalValue = name
      state.use(name)

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
        let from = getProp(parent, 'from')
        if (!from) return

        if (isData(from)) {
          state.use(from.value.value)
          from = toCamelCase(from.value.value)
        } else {
          from = from.value.value
        }

        state.render.push(`{${from}.map((item, i) => `)

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
        dynamic: {
          base: {},
          active: {},
          hover: {},
          activeHover: {},
          disabled: {},
          placeholder: {},
        },
        static: {
          base: {},
          active: {},
          hover: {},
          activeHover: {},
          disabled: {},
          placeholder: {},
        },
      }

      const name = parent.name.value
      if (name === 'Vertical' || name === 'List') {
        node.style.static.base.flexDirection = 'column'
      } else if (name === 'Horizontal') {
        node.style.static.base.flexDirection = 'row'
      }
    },
    leave: PropertiesStyleLeave,
  }

  // const PropertyData = {
  //   enter(node, parent, state) {
  //     if (isData(node)) {
  //       state.render.push(``)
  //       return true
  //     }
  //   }
  // }

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
        if (isToggle(node)) {
          const propToToggle = node.tags.toggle
          const functionName = `toggle${toPascalCase(propToToggle)}`
          state.remap[propToToggle] = {
            body: makeToggle(functionName, propToToggle),
            fn: functionName,
          }
          state.render.push(` ${node.key.value}={props.${functionName}}`)
          return
        }

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
          const target = code ? parent.style.dynamic : parent.style.static
          Object.assign(target[getStyleType(node)], styleForProperty)
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
    BlockDefaultProps,
    BlockExplicitChildren,
    BlockName,
    BlockWhen,

    Block: {
      // TODO Image
      // TODO Capture*
      // TODO List without wrapper?
      enter(node, parent, state) {
        BlockWhen.enter.call(this, node, parent, state)
        BlockName.enter.call(this, node, parent, state)
        BlockDefaultProps.enter.call(this, node, parent, state)
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
        if (node.key.value === 'when' || isData(node)) return
        if (!isValidPropertyForBlock(node, parent)) return

        // if (PropertyData.enter.call(this, node, parent, state)) return
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

export const makeToggle = (fn, prop) =>
  `${fn} = () => this.setState({ ${prop}: !this.state.${prop} })`

const getTests = ({ state, name }) => {
  if (!state.tests) return false

  const tests = {
    name: `Tests${name}`,
  }

  tests.component = `class ${tests.name} extends React.Component {
  constructor(props) {
    super(props)
    this.tests = makeTests(this.display)
    this.state = this.tests[this.tests._main]
  }

  display = next => this.setState(next)

  render() {
    return <${name} {...this.props} {...this.state} />
  }
}`

  return tests
}

const getRemap = ({ state, name }) => {
  if (Object.keys(state.remap).length === 0) return false
  const remap = {
    name: `Remap${name}`,
  }

  const localState = []
  const fns = []
  const methods = Object.keys(state.remap).map(prop => {
    localState.push(`${prop}: props.${prop},`)
    const { body, fn } = state.remap[prop]
    fns.push(`${fn}={this.${fn}}`)
    return body
  })

  remap.component = `class ${remap.name} extends React.Component {
constructor(props) {
super(props)
this.state = ${wrap(localState.join('\n'))}
}
${methods.join('\n')}

render() {
  return <${name} {...this.props} {...this.state} ${fns.join(' ')} />
}
}`

  return remap
}

export const toComponent = ({ getImport, getStyles, name, state }) => {
  const remap = getRemap({ state, name })
  let xport = remap ? remap.name : name
  const tests = getTests({ state, name: xport })
  xport = tests ? tests.name : xport

  return `import React from 'react'
${getDependencies(state.uses, getImport)}
${tests ? `import makeTests from './${name}.view.tests.js'` : ''}

${getStyles(state.styles)}

${tests ? tests.component : ''}
${remap ? remap.component : ''}

${getBody({ state, name })}
${getDefaultProps({ state, name })}
export default ${xport}`
}

export const safe = (value, node) =>
  typeof value === 'string' && !isCode(node)
    ? JSON.stringify(value)
    : wrap(value)

export const wrap = s => `{${s}}`
