import getBody from './get-body.js'
import getDefaultProps from './get-default-props.js'
import getDependencies from './get-dependencies.js'
import getRemap from './get-remap.js'
import getTests from './get-tests.js'

export default ({ getImport, getStyles, name, state }) => {
  const remap = getRemap({ state, name })
  let xport = remap ? remap.name : name
  const tests = getTests({ state, name: xport })
  xport = tests ? tests.name : xport

  return `import React from 'react'
${getDependencies(state.uses, getImport)}
${tests ? `import makeTests from './${name}.view.tests.js'` : ''}

${getStyles(state, name)}

${tests ? tests.component : ''}
${remap ? remap.component : ''}

${getBody({ state, name })}
${getDefaultProps({ state, name })}
export default ${xport}`
}
