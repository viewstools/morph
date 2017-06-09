import getBody from './get-body.js'
import getContext from './get-context.js'
import getDefaultProps from './get-default-props.js'
import getDependencies from './get-dependencies.js'
import getRemap from './get-remap.js'
import getTests from './get-tests.js'

export default ({ getImport, getStyles, name, state }) => {
  const context = getContext({ state, name })
  const remap = getRemap({ state, name })
  let xport = remap ? remap.name : name
  const tests = getTests({ state, name: xport })
  xport = tests ? tests.name : xport

  const dependencies = [
    `import React from 'react'`,
    context && `import PropTypes from 'prop-types'`,
    tests && `import makeTests from './${name}.view.tests.js'`,
    getDependencies(state.uses, getImport),
  ]
    .filter(Boolean)
    .join('\n')

  return `${dependencies}

${getStyles(state, name)}

${tests ? tests.component : ''}
${remap ? remap.component : ''}

${getBody({ state, name })}
${getDefaultProps({ state, name })}
${context ? context : ''}
export default ${xport}`
}
