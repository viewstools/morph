import { existsSync } from 'fs'
import { getScopedName } from '../utils.js'
import getUnit from '../get-unit.js'
import getExpandedProps from './get-expanded-props.js'
import getUseIsHovered from './get-use-is-hovered.js'
import path from 'path'

export default function getBody({ state, name, view }) {
  let render = state.render.join('\n').replace(/props\./g, '')
  if (state.profile || typeof state.profile === 'number') {
    let viewPath = state.flow
      ? ` viewPath={viewPath}`
      : ` viewPath="/DesignSystem/${state.name}"`
    let threshold =
      typeof state.profile === 'number' ? ` threshold={${state.profile}}` : ''

    render = `<fromProfile.Profile${viewPath}${threshold}>
  ${render}
</fromProfile.Profile>`
  }

  let flow = []
  // if (state.flow === 'separate' && state.uses.includes('ViewsUseFlow')) {
  if (state.useFlowHas) {
    flow.push(`  let flow = fromFlow.useFlow()`)
  }
  if (state.useFlowValue) {
    flow.push(
      `  let flowValue = fromFlow.useFlowValue(viewPath) || '${state.flowDefaultState}'`
    )
  }
  // }
  if (state.setFlowTo) {
    flow.push(`  let setFlowTo = fromFlow.useSetFlowTo(viewPath)`)
  }

  let animated = getAnimated({ state })
  let expandedProps = getExpandedProps({ state })
  let listItemDataProvider = getListItemDataProvider({ state, name, view })

  if (state.hasRefs) {
    return `export default class ${name} extends React.Component {
  render() {
    let { props: ${expandedProps} } = this
    return (${render})
  }
}`
  } else {
    return [
      `export default function ${name}(${expandedProps}) {`,
      state.isDesignSystemRoot && `  let viewPath = "${state.viewPath}"`,
      state.useIsBefore && '  let isBefore = useIsBefore()',
      state.useIsHovered && getUseIsHovered({ state }),
      state.useIsMedia && '  let isMedia = useIsMedia()',
      ...flow,
      ...state.variables,
      ...animated,
      `  return ${render ? `(${render})` : 'null'}`,
      '}',
      listItemDataProvider,
    ]
      .filter(Boolean)
      .join('\n')
  }
}

function getAnimated({ state }) {
  if (!state.isAnimated) return []

  let animated = []

  Object.keys(state.animations).forEach((blockId) => {
    Object.values(state.animations[blockId]).forEach((item) => {
      let { curve, ...configValues } = item.animation.properties

      if (!state.isReactNative && curve !== 'spring') return

      let spring = ['{', '"config": {']
      let delay = null
      Object.entries(configValues).forEach(([k, v]) => {
        if (k === 'delay') {
          delay = v
        } else {
          spring.push(`${k}: ${JSON.stringify(v)},`)
        }
      })

      if (curve !== 'spring' && curve !== 'linear') {
        spring.push(`"easing": Easing.${curve.replace('ease', 'easeCubic')},`)
      }
      spring.push('},')

      if (delay) {
        spring.push(`"delay": ${delay},`)
      }

      let toValue = []
      let fromValue = []
      Object.values(item.props).forEach((prop) => {
        prop.scopes.reverse()

        let shouldIncludeUnit =
          state.morpher === 'react-native'
            ? prop.name.startsWith('rotate')
            : true
        let unit = getUnit(
          { name: prop.name, value: prop.value },
          shouldIncludeUnit
        )
        let propValue = unit
          ? typeof prop.value === 'string' && prop.value.includes(unit)
            ? prop.value
            : `${prop.value}${unit}`
          : prop.value

        let value = prop.scopes.reduce((current, scope) => {
          let condition = getScopedName({
            name: scope.name,
            blockNode: item.block,
            propNode: scope.prop,
            scope,
            state,
          })

          let unit = getUnit(
            { name: prop.name, value: scope.value },
            shouldIncludeUnit
          )

          let value = unit
            ? typeof scope.value === 'string' && scope.value.includes(unit)
              ? scope.value
              : `${scope.value}${unit}`
            : scope.value
          let elseValue = current.startsWith('"props.')
            ? current.substring(1, current.length - 1).replace('props.', '')
            : current.replace('props.', '')
          return `${condition.replace('props.', '')} ? ${JSON.stringify(
            value
          )} : ${elseValue}`
        }, JSON.stringify(propValue))

        toValue.push(`${JSON.stringify(prop.name)}: ${value}`)

        let fromValueProp = prop.scopes[0].value
        let fromValuePropUnit = getUnit(
          { name: prop.name, value: fromValueProp },
          shouldIncludeUnit
        )
        fromValueProp = fromValuePropUnit
          ? typeof fromValueProp === 'string' &&
            fromValueProp.includes(fromValuePropUnit)
            ? fromValueProp
            : `${fromValueProp}${unit}`
          : fromValueProp
        fromValue.push(
          `${JSON.stringify(prop.name)}: ${JSON.stringify(fromValueProp)}`
        )
      })

      spring.push(`"from": {${fromValue.join(',')}},`)
      spring.push(`"to": {${toValue.join(',')}},`)
      spring.push('}')

      animated.push(
        `let animated${blockId}${
          item.index > 0 ? item.index : ''
        } = useSpring(${spring.join('\n')})`
      )
    })
  })

  return animated
}

function getListItemDataProvider({ state, view }) {
  if (!state.hasListItem) return ''

  let isUsingDataOnChange = existsSync(
    path.join(path.dirname(view.file), 'useListItemDataOnChange.js')
  )
  let isUsingDataOnSubmit = existsSync(
    path.join(path.dirname(view.file), 'useListItemDataOnSubmit.js')
  )

  return `
  function ListItem(props) {
    let valueItem = React.useMemo(() => ({
      index: props.index,
      indexReverse: props.list.length - props.index,
      isFirst: props.index === 0,
      isLast: props.index === props.list.length - 1,
    }), [props.index, props.list])
    ${
      isUsingDataOnChange ? 'let onChange = useListItemDataOnChange(props)' : ''
    }
    ${
      isUsingDataOnSubmit ? 'let onSubmit = useListItemDataOnSubmit(props)' : ''
    }
    ${
      state.tools
        ? `
    if (process.env.NODE_ENV === 'development' && !props.hasItemKey && !props.item?.id) {
      console.debug({
        type: 'views/data',
        warning: \`Missing "id" property on the item $\{JSON.stringify(props.item)} in context "\${props.context}" so the index in the list will be used as a fallback key. Consider setting "itemKey" if the item has a custom or compound key e.g.  first_name,last_name.\`,
      })
    }`
        : ''
    }
    return (
      <fromData.DataProvider
      context={props.context}
      value={props.item}
      ${isUsingDataOnChange ? 'onChange={onChange}' : ''}
      ${isUsingDataOnSubmit ? 'onSubmit={onSubmit}' : ''}
      viewPath={props.viewPath}
    >
      <fromData.DataProvider
        context={\`\${props.context}_item\`}
        value={valueItem}
        viewPath={props.viewPath}
      >
        {props.children}
      </fromData.DataProvider>
    </fromData.DataProvider>
    )
  }`
}
