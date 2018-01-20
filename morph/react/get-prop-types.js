const types = {
  string: 'string',
  function: 'func',
  boolean: 'bool',
  number: 'number',
}

export default ({ state, name }) => {
  const keys = Object.keys(state.props)
  if (keys.length > 0) {
    const propTypes = Object.keys(state.props)
      .map(prop => `${prop}: PropTypes.${types[state.props[prop]]}.isRequired`)
      .join(',\n')
    return `${name}.propTypes = {${propTypes}}`
  } else {
    return ''
  }
}
