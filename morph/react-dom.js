import * as BlockGoTo from './react-dom/block-go-to.js'
import * as BlockTeleport from './react-dom/block-teleport.js'
import { leave as PropertiesStyleLeave } from './react-dom/properties-style.js'
import getBlockName from './react-dom/get-block-name.js'
import getStyleForProperty from './react-dom/get-style-for-property.js'
import getStyles from './react-dom/get-styles.js'
import getValueForProperty from './react-dom/get-value-for-property.js'
import isValidPropertyForBlock from './react-dom/is-valid-property-for-block.js'
import makeVisitors from './react/make-visitors.js'
import maybeUsesRouter from './react-dom/maybe-uses-router.js'
import maybeUsesStyleSheet from './react-dom/maybe-uses-style-sheet.js'
import morph from './morph.js'
import toComponent from './react/to-component.js'

const imports = {
  Link: "import { Link } from 'react-router-dom'",
  Route: "import { Route } from 'react-router-dom'",
  Router: "import { BrowserRouter as Router } from 'react-router-dom'",
}

export default ({
  getImport,
  inlineStyles = true,
  file,
  name,
  tests = false,
  view,
}) => {
  const state = {
    captures: [],
    defaultProps: false,
    file,
    fonts: [],
    inlineStyles,
    remap: {},
    render: [],
    styles: {},
    todos: [],
    uses: [],
    tests,
    use(name) {
      if (!state.uses.includes(name) && !/props/.test(name))
        state.uses.push(name)
    },
  }

  const {
    BlockDefaultProps,
    BlockExplicitChildren,
    BlockName,
    BlockRoute,
    BlockWhen,
    ...visitors
  } = makeVisitors({
    getBlockName,
    getStyleForProperty,
    getValueForProperty,
    isValidPropertyForBlock,
    PropertiesStyleLeave,
  })

  visitors.Block = {
    // TODO Capture*
    // TODO List without wrapper?
    enter(node, parent, state) {
      ;[
        BlockWhen.enter,
        BlockRoute.enter,
        BlockName.enter,
        BlockTeleport.enter,
        BlockGoTo.enter,
        BlockDefaultProps.enter,
      ].forEach(fn => fn.call(this, node, parent, state))
    },
    leave(node, parent, state) {
      ;[
        BlockExplicitChildren.leave,
        BlockName.leave,
        BlockRoute.leave,
        BlockWhen.leave,
      ].forEach(fn => fn.call(this, node, parent, state))
    },
  }

  morph(view, state, visitors)

  maybeUsesStyleSheet(state)
  maybeUsesRouter(state)

  const finalGetImport = name => imports[name] || getImport(name)

  return toComponent({ getImport: finalGetImport, getStyles, name, state })
}
