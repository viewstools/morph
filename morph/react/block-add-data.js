import toCamelCase from 'to-camel-case'

export function enter(node, parent, state) {
  if (node.data) {
    let name = getDataVariableName(node)

    node.data.name = name

    if (!state.usedDataNames.includes(name)) {
      state.dataBlocks.push(
        `let ${name} = fromData.useData({ viewPath, path: '${node.data.path}', `
      )
      maybeDataContext(node.data, state.dataBlocks)
      maybeDataFormat(node.data.format, state.dataBlocks)
      maybeDataValidate(node.data.validate, state.dataBlocks)
      state.dataBlocks.push('})')

      // pushing it on to the state to indicate if it was already defined
      state.usedDataNames.push(name)
    }

    state.hasData = true
  }
}

function getDataVariableName(node) {
  // keep the same name if the data is defined at the view level
  return node.isView
    ? 'data'
    : // using the format and validate as part of the name to uniquely identify a data key
      `${toCamelCase(
        [
          node.data.path.replace(/\./g, '_'),
          node.data.format?.formatIn,
          node.data.format?.formatOut,
          node.data.validate?.value,
          node.data.validate?.required ? 'required' : null,
          'data',
        ]
          .filter(Boolean)
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
