import getBody from './get-body.js'
import getContextTypes from './get-context-types.js'
import getDefaultProps from './get-default-props.js'
import getDependencies from './get-dependencies.js'
import getRemap from './get-remap.js'
import getTests from './get-tests.js'

export default ({ getImport, getStyles, name, state }) => {
  const hasContext = state.debug
  const remap = getRemap({ state, name })
  let xport = remap ? remap.name : name

  const tests = getTests({ state, name: xport })
  if (tests) xport = tests.name
  // TODO remove withRouter when
  // https://github.com/ReactTraining/react-router/issues/4571 or 5127 are merged and
  // relative links are supported
  if (state.withRouter) xport = `withRouter(${xport})`

  const dependencies = [
    `import React from 'react'`,
    state.withRouter && `import { withRouter } from 'react-router'`,
    tests && `import * as fromTests from './${name}.view.tests.js'`,
    hasContext && `import PropTypes from 'prop-types'`,
    getDependencies(state, getImport),
  ]
    .filter(Boolean)
    .join('\n')

  // TODO Emojis should be wrapped in <span>, have role="img", and have an accessible description
  // with aria-label or aria-labelledby  jsx-a11y/accessible-emoji
  return `/* eslint-disable jsx-a11y/accessible-emoji, no-unused-vars */
${dependencies}
${getStyles(state, name)}

${tests ? tests.component : ''}
${remap ? remap.component : ''}

${getBody({ state, name })}
${getDefaultProps({ state, name })}
${hasContext ? getContextTypes({ state, name }) : ''}
export default ${xport}`
}
