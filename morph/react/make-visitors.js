import {
  asScopedValue,
  getObjectAsString,
  getProp,
  getPropertiesAsObject,
  getStyleType,
  isCode,
  isData,
  isStyle,
  isToggle,
} from '../utils.js'
import makeToggle from './make-toggle.js'
import safe from './safe.js'
import toCamelCase from 'to-camel-case'
import toPascalCase from 'to-pascal-case'
import wrap from './wrap.js'

export default ({
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
      const name = getBlockName(node, parent, state)
      if (name === null) return this.skip()

      node.name.finalValue = name
      state.use(/Animated/.test(name) ? 'Animated' : name)

      state.render.push(`<${name}`)

      if (state.debug && node.isBasic && !node.properties) {
        node.isDebugged = true

        state.render.push(
          ` onClick={(e) => context.selectBlock(e, ${node.loc.start
            .line}, '${state.name}')}
            onMouseOver={(e) => context.hoverBlock(e, '${node.is ||
              node.name.value}', '${state.name}')}`
        )
      }
    },
    leave(node, parent, state) {
      if (
        (!parent && node.blocks) ||
        node.explicitChildren ||
        (node.blocks && node.blocks.list.length > 0)
      ) {
        if (!parent && node.blocks) {
          if (node.blocks.list.length === 0) {
            state.render.push('>')
          }

          if (!node.usesProxy) {
            state.render.push(`{props.children}`)
          }
        }
        state.render.push(`</${node.name.finalValue}>`)
      } else {
        state.render.push('/>')
      }
    },
  }

  const BlockProxy = {
    enter(node, parent, state) {
      if (node.name.value !== 'Proxy') return

      let prevParent = parent
      while (prevParent) {
        if (prevParent.type === 'Block' && !prevParent.parent) {
          prevParent.usesProxy = true
        }
        prevParent = prevParent.parent
      }

      if (!node.properties) return

      let proxied = node.properties.list.find(p => p.key.value === 'from')
      if (!proxied) return
      proxied = proxied.value.value

      const otherProperties = node.properties.list.filter(
        p => p.key.value !== 'from' && p.key.value !== 'when'
      )

      if (!node.when) {
        state.render.push('{')
      }

      if (proxied === 'all') {
        const childContent = otherProperties.length > 0
          ? `React.Children.map(props.children, child => React.cloneElement(child, ${getPropertiesAsObject(
              otherProperties
            )}))`
          : 'props.children'

        state.render.push(childContent)
      } else {
        if (!node.when) {
          state.render.push('props.childrenProxyMap && ')
        }
        const child = `childrenArray[props.childrenProxyMap['${proxied}']]`

        if (otherProperties.length > 0) {
          if (node.when) {
            if (state.render[state.render.length - 1].endsWith(' ? ')) {
              state.render[state.render.length - 1] = state.render[
                state.render.length - 1
              ].replace(' ? ', ' && ')
            }
          }

          state.render.push(
            ` ${child} ? React.cloneElement(${child}, ${getPropertiesAsObject(
              otherProperties
            )}) : null`
          )
        } else {
          state.render.push(child)
        }

        state.usesChildrenArray = true
      }

      state.render.push('}')

      this.skip()
    },
  }

  const BlockWhen = {
    enter(node, parent, state) {
      // when lets you show/hide blocks depending on props
      const when = getProp(node, 'when')
      if (when) {
        node.when = true

        if (parent && parent.parent.name.value !== 'List')
          state.render.push('{')

        state.render.push(`${when.value.value} ? `)
      }
    },
    leave(node, parent, state) {
      if (node.when) {
        state.render.push(` : null`)
        if (parent && parent.parent.name.value !== 'List')
          state.render.push('}')
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

  const BlockMaybeNeedsProperties = {
    enter(node, parent, state) {
      const name = node.name.value

      if (
        !node.properties &&
        (name === 'Vertical' || name === 'List' || name === 'Horizontal')
      ) {
        node.properties = {
          type: 'Properties',
          list: [
            {
              type: 'Property',
              loc: {},
              key: {
                type: 'Literal',
                value: 'flexDirection',
                valueRaw: 'flexDirection',
                loc: {},
              },
              value: {
                type: 'Literal',
                loc: {},
                value: name === 'Horizontal' ? 'row' : 'column',
              },
              meta: {},
              tags: {
                style: true,
              },
            },
          ],
        }
      }

      // fake properites so that our childrenProxyMap gets picked up in case
      // there are no custom props
      if (node.childrenProxyMap && !node.properties) {
        node.properties = {
          type: 'Properties',
          list: [],
        }
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

        state.render.push(
          `{Array.isArray(${from}) && ${from}.map((item, index) => `
        )

        node.list.forEach(n => (n.isInList = true))
      }
    },
    leave(node, parent, state) {
      if (parent.name.value === 'List') {
        state.render.push(')}')
      }
    },
  }

  const BlockRoute = {
    enter(node, parent, state) {
      const at = getProp(node, 'at')
      if (at) {
        let [path, isExact = false] = at.value.value.split(' ')
        state.use('Route')

        if (path === '/') state.use('Router')

        if (!path.startsWith('/')) {
          path = isCode(path) ? `\`\${${path}}\`` : path
          // path = `\`\${props.match.url}/${to}\``
        }

        node.isRoute = true
        state.render.push(
          `<Route path=${safe(path)} ${isExact
            ? 'exact'
            : ''} render={routeProps => `
        )
      }
    },
    leave(node, parent, state) {
      if (node.isRoute) {
        state.render.push('} />')
      }
    },
  }

  const PropertiesChildrenProxyMap = {
    leave(node, parent, state) {
      if (parent.childrenProxyMap) {
        state.render.push(
          ` childrenProxyMap={${getObjectAsString(parent.childrenProxyMap)}}`
        )
      }
    },
  }

  const PropertiesDebug = {
    leave(node, parent, state) {
      if (state.debug && parent.isBasic && !parent.isDebugged) {
        state.render.push(
          ` onClick={(e) => context.selectBlock(e, ${parent.loc.start
            .line}, '${state.name}')}
            onMouseOver={(e) => context.hoverBlock(e, '${parent.is ||
              parent.name.value}', '${state.name}')}`
        )
      }
    },
  }

  const PropertiesListKey = {
    leave(node, parent, state) {
      if (parent.isInList && !node.hasKey) {
        state.render.push(' key={index}')
      }
    },
  }

  const PropertiesRoute = {
    leave(node, parent, state) {
      if (parent.isRoute) {
        state.render.push(' {...routeProps}')
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
          print: {},
        },
        static: {
          base: {},
          active: {},
          hover: {},
          activeHover: {},
          disabled: {},
          placeholder: {},
          print: {},
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
        // TODO remove toggle
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

        // if (node.key.value === 'onSubmit') {
        //   state.render.push(
        //     ` ${node.key.value}={() => ${node.value.value}(state)}`
        //   )
        //   return
        // }

        if (
          state.debug &&
          parent.parent.isBasic &&
          node.key.value === 'onClick'
        ) {
          parent.parent.isDebugged = true

          state.render.push(
            ` onClick={(e) => {
                  if (!context.selectBlock(e, ${parent.parent.loc.start
                    .line}, '${state.name}')) {
                    try {
                      (${node.value.value})();
                    } catch(err) {
                    }
                  }
                }}
                onMouseOver={(e) => context.hoverBlock(e, '${parent.parent.is ||
                  parent.parent.name.value}', '${state.name}')}`
          )
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
        if (parent.parent.scoped.text) {
          parent.parent.explicitChildren = wrap(
            asScopedValue(parent.parent.scoped.text, node.value.value, parent)
          )
        } else {
          parent.parent.explicitChildren = isCode(node)
            ? wrap(node.value.value)
            : node.value.value
        }

        return true
      }
    },
  }

  return {
    BlockDefaultProps,
    BlockExplicitChildren,
    BlockMaybeNeedsProperties,
    BlockName,
    BlockProxy,
    BlockRoute,
    BlockWhen,

    Block: {
      // TODO Image
      // TODO Capture*
      // TODO List without wrapper?
      enter(node, parent, state) {
        BlockWhen.enter.call(this, node, parent, state)
        BlockRoute.enter.call(this, node, parent, state)
        BlockName.enter.call(this, node, parent, state)
        BlockDefaultProps.enter.call(this, node, parent, state)
        BlockMaybeNeedsProperties.enter.call(this, node, parent, state)
        BlockProxy.enter.call(this, node, parent, state)
      },
      leave(node, parent, state) {
        BlockExplicitChildren.leave.call(this, node, parent, state)
        BlockName.leave.call(this, node, parent, state)
        BlockRoute.leave.call(this, node, parent, state)
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
        PropertiesRoute.leave.call(this, node, parent, state)
        PropertiesDebug.leave.call(this, node, parent, state)
        PropertiesChildrenProxyMap.leave.call(this, node, parent, state)
      },
    },

    Property: {
      enter(node, parent, state) {
        const key = node.key.value
        if (
          key === 'at' ||
          key === 'when' ||
          isData(node) ||
          (!isValidPropertyForBlock(node, parent) && parent.parent.isBasic) ||
          node.tags.scope ||
          node.inScope
        )
          return

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
