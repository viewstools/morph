import toSnakeCase from 'to-snake-case'
import toCamelCase from 'to-camel-case'

export function enter(node, parent, state) {
  for (let data of node.data) {
    let name = getDataVariableName(data)

    data.name = name

    if (!state.usedDataNames.includes(name)) {
      state.dataBlocks.push(
        `let ${name} = fromData.useData({ viewPath, path: '${data.path}', `
      )
      maybeDataContext(data, state.dataBlocks)
      maybeDataFormat(data.format, state.dataBlocks)
      maybeDataValidate(data.validate, state.dataBlocks)
      state.dataBlocks.push('})')

      // pushing it on to the state to indicate if it was already defined
      state.usedDataNames.push(name)
    }

    state.use('ViewsUseData')
  }
}

function getDataVariableName(data) {
  return `${toCamelCase(
    [
      data.path.replace(/\./g, '_'),
      data.format?.formatIn,
      data.format?.formatOut,
      data.validate?.value,
      data.validate?.required ? 'required' : null,
      'data',
    ]
      .filter(Boolean)
      .map(toSnakeCase)
      .join('_')
  )}`
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
