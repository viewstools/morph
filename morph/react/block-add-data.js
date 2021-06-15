import toSnakeCase from 'to-snake-case'
import toCamelCase from 'to-camel-case'

import { getImportNameForSource, getVariableName } from '../utils.js'

export function enter(node, parent, state) {
  for (let dataGroup of node.data) {
    for (let data of dataGroup.data) {
      if (data.isConstant) {
        addConstantData(data, state)
      } else {
        addData(data, !!dataGroup.aggregate, state)
      }
    }

    if (dataGroup.aggregate) {
      dataGroup.name = getDataVariableName(['aggregate'], state)
      let importName = getAggregateImportName(dataGroup.aggregate.source, state)
      state.variables.push(
        `let ${dataGroup.name} = ${importName}.${
          dataGroup.aggregate.value
        }(${dataGroup.data
          .map((d) => (d.isConstant ? d.name : d.variables.value))
          .join(', ')})`
      )
      dataGroup.context = dataGroup.data[0].context
      dataGroup.path = dataGroup.data[0].path
    } else {
      // no aggregate function so will use the data directly
      dataGroup.name = dataGroup.data[0].name
      dataGroup.variables = dataGroup.data[0].variables
      // the list item data provider functionality makes use of the path
      // so adding it to keep consistency with already generated data providers
      dataGroup.context = dataGroup.data[0].context
      dataGroup.path = dataGroup.data[0].path
    }
  }
}

function addConstantData(data, state) {
  data.name = getDataVariableName(['constant'], state)

  if (data.format?.formatIn) {
    let importName = getImportNameForSource(data.format.formatIn.source, state)
    state.variables.push(
      `let ${data.name} = ${importName}.${data.format.formatIn.value}(${data.value})`
    )
  } else {
    state.variables.push(`let ${data.name} = ${data.value}`)
  }
}

function addData(data, isAggregate, state) {
  data.variables = {}

  if (data.uses.has('useDataValue') || isAggregate) {
    let dataValueName = getDataVariableName(
      [data.context, data.path, 'value'],
      state
    )
    state.variables.push(
      `let ${dataValueName} = fromData.${
        data.format?.formatIn ? 'useDataFormat' : 'useDataValue'
      }({ viewPath,`
    )
    maybeDataContext(data, state)
    maybeDataPath(data, state)
    maybeDataFormat(data, state)
    state.variables.push('})')
    data.variables.value = dataValueName
  }

  if (data.validate && data.validate.type === 'js') {
    if (data.uses.has('useDataIsValidInitial')) {
      let dataIsValidInitialName = getDataVariableName(
        [data.context, data.path, 'isValidInitial'],
        state
      )
      state.variables.push(
        `let ${dataIsValidInitialName} = fromData.useDataIsValidInitial({ viewPath,`
      )
      maybeDataContext(data, state)
      maybeDataPath(data, state)
      maybeDataValidate(data, state)
      state.variables.push('})')
      data.variables.isValidInitial = dataIsValidInitialName

      state.ignoredExpandedProps.push('isValidInitial')
      state.ignoredExpandedProps.push('isInvalidInitial')
    }

    if (data.uses.has('useDataIsValid')) {
      let dataIsValidName = getDataVariableName(
        [data.context, data.path, 'isValid'],
        state
      )
      state.variables.push(
        `let ${dataIsValidName} = fromData.useDataIsValid({ viewPath,`
      )
      maybeDataContext(data, state)
      maybeDataPath(data, state)
      maybeDataValidate(data, state)
      if (data.validate.required) {
        state.variables.push('required: true,')
      }
      state.variables.push('})')
      data.variables.isValid = dataIsValidName

      state.ignoredExpandedProps.push('isValid')
      state.ignoredExpandedProps.push('isInvalid')
    }
  }

  if (data.uses.has('useDataChange')) {
    let dataChangeName = getDataVariableName(
      [data.context, data.path, 'change'],
      state
    )
    state.variables.push(
      `let ${dataChangeName} = fromData.useDataChange({ viewPath,`
    )
    maybeDataContext(data, state)
    maybeDataPath(data, state)
    maybeDataFormatOut(data, state)
    state.variables.push('})')
    data.variables.onChange = dataChangeName

    state.ignoredExpandedProps.push('onChange')
  }

  if (data.uses.has('useDataSubmit')) {
    let dataSubmitName = getDataVariableName(
      [data.context, data.path, 'submit'],
      state
    )
    state.variables.push(
      `let ${dataSubmitName} = fromData.useDataSubmit({ viewPath,`
    )
    maybeDataContext(data, state)
    state.variables.push('})')
    data.variables.onSubmit = dataSubmitName

    state.ignoredExpandedProps.push('onSubmit')
  }

  if (data.uses.has('useDataIsSubmitting')) {
    let dataIsSubmittingName = getDataVariableName(
      [data.context, data.path, 'isSubmitting'],
      state
    )
    state.variables.push(
      `let ${dataIsSubmittingName} = fromData.useDataIsSubmitting({ viewPath,`
    )
    maybeDataContext(data, state)
    state.variables.push('})')
    data.variables.isSubmitting = dataIsSubmittingName

    state.ignoredExpandedProps.push('isSubmitting')
  }

  state.use('ViewsUseData')
}

function maybeDataContext(dataDefinition, state) {
  if (dataDefinition.context === null) return

  state.variables.push(`context: '${dataDefinition.context}',`)
}

function maybeDataPath(dataDefinition, state) {
  if (!dataDefinition.path) return

  state.variables.push(`path: '${dataDefinition.path}',`)
}

function maybeDataFormat(data, state) {
  if (!data.format?.formatIn) return

  let importName = getFormatImportName(data.format.formatIn.source, state)
  state.variables.push(`format: ${importName}.${data.format.formatIn.value},`)
}

function maybeDataFormatOut(data, state) {
  if (!data.format?.formatOut) return

  let importName = getFormatImportName(data.format.formatOut.source, state)
  state.variables.push(
    `formatOut: ${importName}.${data.format.formatOut.value},`
  )
}

function maybeDataValidate(data, state) {
  if (!data.validate || data.validate.type !== 'js') return
  let importName = getValidateImportName(data.validate.source, state)
  state.variables.push(`validate: ${importName}.${data.validate.value},`)
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

function getDataVariableName(params, state) {
  return getVariableName(transformToCamelCase([...params, 'data']), state)
}

function transformToCamelCase(args) {
  return toCamelCase(
    args
      .filter(Boolean)
      .map((arg) => arg.replace(/\./g, '_'))
      .map(toSnakeCase)
      .join('_')
  )
}
