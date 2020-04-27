import getBody from './get-body.js'
import getDefaultProps from './get-default-props.js'
import getDependencies from './get-dependencies.js'
import getFlatList from './get-flatlist.js'

export default ({ getImport, getStyles, name, state }) => {
  // TODO Emojis should be wrapped in <span>, have role="img", and have an accessible description
  // with aria-label or aria-labelledby  jsx-a11y/accessible-emoji
  return `/* eslint-disable jsx-a11y/accessible-emoji, no-unused-vars, no-dupe-keys, react/jsx-no-duplicate-props */
// This file is auto-generated. Edit ${name}.view to change it. More info: https://github.com/viewstools/docs/blob/master/UseViews/README.md#viewjs-is-auto-generated-and-shouldnt-be-edited
${getDependencies(state, getImport)}

${getStyles(state, name)}
${getFlatList(state, name)}

${getBody({ state, name })}
${getDefaultProps({ state, name })}`
}
