import { getImportNameForSource } from '../utils'

export function enter(node, parent, state) {
  if (node.name !== 'View' || !node.setFlowToBasedOnData) return

  if (isSetFlowToBasedOnDataIsSubmitting(node)) {
    state.variables.push(
      `fromData.useSetFlowToBasedOnDataIsSubmitting({ viewPath,`
    )
    maybeDataContext(node.setFlowToBasedOnData, state)
    state.variables.push('})')
  } else if (isSetFlowToBasedOnDataIsValid(node)) {
    state.variables.push(`fromData.useSetFlowToBasedOnDataIsValid({ viewPath,`)
    maybeDataContext(node.setFlowToBasedOnData, state)
    maybeDataPath(node.setFlowToBasedOnData, state)
    maybeDataValidate(node.setFlowToBasedOnData, state)
    maybeDataValidateInitial(node.setFlowToBasedOnData, state)
    state.variables.push('})')
  } else if (isSetFlowToBasedOnDataIsInvalid(node)) {
    state.variables.push(
      `fromData.useSetFlowToBasedOnDataIsInvalid({ viewPath,`
    )
    maybeDataContext(node.setFlowToBasedOnData, state)
    maybeDataPath(node.setFlowToBasedOnData, state)
    maybeDataValidate(node.setFlowToBasedOnData, state)
    maybeDataValidateInitial(node.setFlowToBasedOnData, state)
    state.variables.push('})')
  } else if (isSetFlowToBasedOnDataExists(node)) {
    state.variables.push(`fromData.useSetFlowToBasedOnDataExists({ viewPath,`)
    maybeDataContext(node.setFlowToBasedOnData, state)
    maybeDataPath(node.setFlowToBasedOnData, state)
    maybeDataFormat(node.setFlowToBasedOnData, state)
    state.variables.push('})')
  } else {
    state.variables.push(`fromData.useSetFlowToBasedOnDataSwitch({ viewPath,`)
    maybeDataContext(node.setFlowToBasedOnData, state)
    maybeDataPath(node.setFlowToBasedOnData, state)
    maybeDataFormat(node.setFlowToBasedOnData, state)
    state.variables.push('})')
  }

  state.use('ViewsUseData')
}

function isSetFlowToBasedOnDataExists(node) {
  return (
    (!!node.setFlowToBasedOnData.content ||
      node.children.some((child) => child.name === 'Content')) &&
    node.children.length === 2
  )
}

function isSetFlowToBasedOnDataIsSubmitting(node) {
  return (
    node.children.some((child) => child.name === 'IsSubmitting') &&
    node.children.length === 2
  )
}

function isSetFlowToBasedOnDataIsValid(node) {
  return (
    node.children.some((child) => child.name === 'IsValid') &&
    node.children.length === 2
  )
}

function isSetFlowToBasedOnDataIsInvalid(node) {
  return (
    node.children.some((child) => child.name === 'IsInvalid') &&
    node.children.length === 2
  )
}

function maybeDataContext(dataDefinition, state) {
  if (dataDefinition.context === null) return

  state.variables.push(`context: '${dataDefinition.context}',`)
}

function maybeDataPath(dataDefinition, state) {
  if (!dataDefinition.path) return

  state.variables.push(`path: '${dataDefinition.path}',`)
}

function maybeDataNo(dataDefinition, state) {
  if (!dataDefinition.no) return

  state.variables.push(`no: '${dataDefinition.no}',`)
}

function maybeDataContent(dataDefinition, state) {
  if (!dataDefinition.content) return

  state.variables.push(`content: '${dataDefinition.content}',`)
}

function maybeDataIsSubmitting(dataDefinition, state) {
  if (!dataDefinition.isSubmitting) return

  state.variables.push(`isSubmitting: '${dataDefinition.isSubmitting}',`)
}

function maybeDataIsValid(dataDefinition, state) {
  if (!dataDefinition.isValid) return

  state.variables.push(`isValid: '${dataDefinition.isValid}',`)
}

function maybeDataIsInvalid(dataDefinition, state) {
  if (!dataDefinition.isInvalid) return

  state.variables.push(`isInvalid: '${dataDefinition.isInvalid}',`)
}

function maybeDataValidateInitial(dataDefinition, state) {
  if (
    dataDefinition.validateInitial !== true &&
    dataDefinition.validateInitial !== false
  )
    return

  state.variables.push(`validateInitial: ${dataDefinition.validateInitial},`)
}

function maybeDataValidate(data, state) {
  if (!data.validate) return

  let importName = getValidateImportName(data.validate.source, state)
  state.variables.push(`validate: ${importName}.${data.validate.value},`)
}

function maybeDataFormat(data, state) {
  if (!data.format?.formatIn) return

  let importName = getFormatImportName(data.format.formatIn.source, state)
  state.variables.push(`format: ${importName}.${data.format.formatIn.value},`)
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
