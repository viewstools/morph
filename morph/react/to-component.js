import getBody from './get-body.js'
import getDefaultProps from './get-default-props.js'
import getDependencies from './get-dependencies.js'
import getRemap from './get-remap.js'
import getTests from './get-tests.js'

export default ({ getImport, getStyles, name, state }) => {
  const remap = getRemap({ state, name })
  let xport = remap ? remap.name : name

  const tests = getTests({ state, name: xport })
  if (tests) xport = tests.name
  // TODO remove withRouter when
  // https://github.com/ReactTraining/react-router/issues/4571 is merged and
  // relative links are supported
  if (state.withRouter) xport = `withRouter(${xport})`

  const dependencies = [
    `import React from 'react'`,
    state.withRouter && `import { withRouter } from 'react-router'`,
    tests && `import makeTests from './${name}.view.tests.js'`,
    getDependencies(state.uses, getImport),
  ]
    .filter(Boolean)
    .join('\n')

  // TODO Emojis should be wrapped in <span>, have role="img", and have an accessible description
  // with aria-label or aria-labelledby  jsx-a11y/accessible-emoji
  return `/* eslint-disable jsx-a11y/accessible-emoji */
${dependencies}

${getStyles(state, name)}

${tests ? tests.component : ''}
${remap ? remap.component : ''}

${getBody({ state, name })}
${getDefaultProps({ state, name })}
export default ${xport}`
}
