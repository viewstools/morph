import { getScopedName } from '../utils.js'
import getUnit from '../get-unit.js'
import getExpandedProps from './get-expanded-props.js'
import getUseIsHovered from './get-use-is-hovered.js'

export default function getBody({ state, name }) {
  let render = state.render.join('\n').replace(/props\./g, '')

  let flow = []
  if (
    state.useFlow ||
    (state.flow === 'separate' && state.uses.includes('ViewsUseFlow'))
  ) {
    flow.push(`let flow = fromFlow.useFlow()`)
  }
  if (state.setFlowTo) {
    flow.push(`let setFlowTo = fromFlow.useSetFlowTo(viewPath)`)
  }

  let data = []
  if (state.data) {
    data.push(
      `let data = fromData.useData({ viewPath, path: '${state.data.path}', `
    )
    maybeDataContext(state.data, data)
    maybeDataFormat(state.dataFormat, data)
    maybeDataValidate(state.dataValidate, data)
    data.push('})')
  }

  let animated = getAnimated({ state })
  let expandedProps = getExpandedProps({ state })

  if (state.hasRefs) {
    return `export default class ${name} extends React.Component {
  render() {
    let { props: ${expandedProps} } = this
    return (${render})
  }
}`
  } else {
    let ret = render ? `(${render})` : null

    return `export default function ${name}(${expandedProps}) {
    ${state.useIsBefore ? 'let isBefore = useIsBefore()' : ''}
    ${state.useIsHovered ? getUseIsHovered({ state }) : ''}
    ${state.useIsMedia ? 'let isMedia = useIsMedia()' : ''}
    ${flow.join('\n')}
    ${data.join('\n')}
    ${animated.join('\n')}

  return ${ret}
}`
  }
}

function maybeDataContext(dataDefinition, data) {
  if (dataDefinition.context === null) return

  data.push(`context: '${dataDefinition.context}',`)
}
function maybeDataFormat(format, data) {
  if (!format) return

  if (format.formatIn) {
    data.push(`formatIn: '${format.formatIn}',`)
  }

  if (format.formatOut) {
    data.push(`formatOut: '${format.formatOut}',`)
  }
}
function maybeDataValidate(validate, data) {
  if (!validate || validate.type !== 'js') return
  data.push(`validate: '${validate.value}',`)
  if (validate.required) {
    data.push('validateRequired: true,')
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

          return `${condition}? ${JSON.stringify(value)} : ${current}`
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
