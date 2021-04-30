import toSnakeCase from 'to-snake-case'
import toCamelCase from 'to-camel-case'

import { getImportNameForSource, getVariableName } from '../utils.js'

export function enter(node, parent, state) {
  for (let dataGroup of node.data) {
    for (let data of dataGroup.data) {
      if (data.isConstant) {
        addConstantData(data, state)
      } else {
        addData(data, state)
      }
    }

    if (dataGroup.aggregate) {
      dataGroup.name = getVariableName('aggregateData', state)
      dataGroup.valueName = dataGroup.name
      let importName = getAggregateImportName(dataGroup.aggregate.source, state)
      state.variables.push(
        `let ${dataGroup.name} = ${importName}.${
          dataGroup.aggregate.value
        }(${dataGroup.data.map((d) => d.name).join(', ')})`
      )
      dataGroup.path = dataGroup.data[0].path
    } else {
      // no aggregate function so will use the data directly
      dataGroup.name = dataGroup.data[0].name
      dataGroup.valueName = dataGroup.data[0].valueName
      // the list item data provider functionality makes use of the path
      // so adding it to keep consistency with already generated data providers
      dataGroup.path = dataGroup.data[0].path
    }
  }
}

function addConstantData(data, state) {
  data.name = getVariableName('constantData', state)
  data.valueName = data.name

  if (data.format?.formatIn) {
    let importName = getImportNameForSource(data.format.formatIn.source, state)
    state.variables.push(
      `let ${data.name} = ${importName}.${data.format.formatIn.value}(${data.value})`
    )
  } else {
    state.variables.push(`let ${data.name} = ${data.value}`)
  }
}

function addData(data, state) {
  data.name = getDataVariableName(data, state)
  data.valueName = `${data.name}.value`

  // at the moment it will create multiple instances for the same data key
  // an optimization will be implemented to reuse a variable if possible
  state.variables.push(
    `let ${data.name} = fromData.useData({ viewPath, path: '${data.path}', `
  )
  maybeDataContext(data, state)
  maybeDataFormat(data.format, state)
  maybeDataValidate(data.validate, state)
  state.variables.push('})')

  state.use('ViewsUseData')
}

function getDataVariableName(data, state) {
  let name = `${toCamelCase(
    [
      data.path.replace(/\./g, '_'),
      data.format?.formatIn?.value,
      data.format?.formatOut?.value,
      data.validate?.value,
      data.validate?.required ? 'required' : null,
      'data',
    ]
      .filter(Boolean)
      .map(toSnakeCase)
      .join('_')
  )}`
  return getVariableName(name, state)
}

function maybeDataContext(dataDefinition, state) {
  if (dataDefinition.context === null) return

  state.variables.push(`context: '${dataDefinition.context}',`)
}

function maybeDataFormat(format, state) {
  if (!format) return

  if (format.formatIn) {
    let importName = getFormatImportName(format.formatIn.source, state)
    state.variables.push(`formatIn: ${importName}.${format.formatIn.value},`)
  }

  if (format.formatOut) {
    let importName = getFormatImportName(format.formatOut.source, state)
    state.variables.push(`formatOut: ${importName}.${format.formatOut.value},`)
  }
}

function maybeDataValidate(validate, state) {
  if (!validate || validate.type !== 'js') return
  let importName = getValidateImportName(validate.source, state)
  state.variables.push(`validate: ${importName}.${validate.value},`)
  if (validate.required) {
    state.variables.push('validateRequired: true,')
  }
}

function getAggregateImportName(source, state) {
  let importName
  if (source) {
    importName = getImportNameForSource(source, state)
  } else {
    state.use('ViewsUseDataAggregate')
    importName = 'fromViewsAggregate'
  }
  return importName
}

function getValidateImportName(source, state) {
  let importName
  if (source) {
    importName = getImportNameForSource(source, state)
  } else {
    state.use('ViewsUseDataValidate')
    importName = 'fromViewsValidate'
  }
  return importName
}

function getFormatImportName(source, state) {
  let importName
  if (source) {
    importName = getImportNameForSource(source, state)
  } else {
    state.use('ViewsUseDataFormat')
    importName = 'fromViewsFormat'
  }
  return importName
}
