import getBody from './get-body.js'
import getDefaultProps from './get-default-props.js'
import getDependencies from './get-dependencies.js'
import getPropTypes from './get-prop-types.js'

export default ({ getImport, getStyles, name, state }) => {
  let xport = name

  // TODO remove withRouter when
  // https://github.com/ReactTraining/react-router/issues/4571 or 5127 are merged and
  // relative links are supported
  if (state.withRouter) xport = `withRouter(${xport})`

  const dependencies = [
    `import React from 'react'`,
    state.withRouter && `import { withRouter } from 'react-router'`,
    getDependencies(state, getImport),
  ]
    .filter(Boolean)
    .join('\n')

  // TODO Emojis should be wrapped in <span>, have role="img", and have an accessible description
  // with aria-label or aria-labelledby  jsx-a11y/accessible-emoji
  return `/* eslint-disable jsx-a11y/accessible-emoji, no-unused-vars */
${dependencies}
${getStyles(state, name)}

${getBody({ state, name })}
${getDefaultProps({ state, name })}
${getPropTypes({ state, name })}
export default ${xport}`
}
