import * as BlockGoTo from './react-dom/block-go-to.js'
import * as BlockTeleport from './react-dom/block-teleport.js'
import { leave as PropertiesStyleLeave } from './react-dom/properties-style.js'
import getBlockName from './react-dom/get-block-name.js'
import getStyleForProperty from './react-dom/get-style-for-property.js'
import getStyles from './react-dom/get-styles.js'
import getValueForProperty from './react-dom/get-value-for-property.js'
import makeVisitors from './react/make-visitors.js'
import morph from './morph.js'
import toComponent from './react/to-component.js'

export default ({ getImport, name, tests = false, view }) => {
  const state = {
    captures: [],
    defaultProps: false,
    fonts: [],
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
      BlockWhen.enter.call(this, node, parent, state)
      BlockRoute.enter.call(this, node, parent, state)
      BlockName.enter.call(this, node, parent, state)
      BlockTeleport.enter.call(this, node, parent, state)
      BlockGoTo.enter.call(this, node, parent, state)
      BlockDefaultProps.enter.call(this, node, parent, state)
    },
    leave(node, parent, state) {
      BlockExplicitChildren.leave.call(this, node, parent, state)
      BlockName.leave.call(this, node, parent, state)
      BlockRoute.leave.call(this, node, parent, state)
      BlockWhen.leave.call(this, node, parent, state)
    },
  }

  morph(view, state, visitors)

  if (Object.keys(state.styles).length > 0) {
    state.uses.push('glam')
  }

  if (state.uses.includes('Router')) {
    state.render = ['<Router>', ...state.render, '</Router>']
  }

  const imports = {
    Link: "import { Link } from 'react-router-dom'",
    Route: "import { Route } from 'react-router-dom'",
    Router: "import { BrowserRouter as Router } from 'react-router-dom'",
  }

  const finalGetImport = name => imports[name] || getImport(name)

  return toComponent({ getImport: finalGetImport, getStyles, name, state })
}

const blacklist = ['backgroundSize', 'teleportTo', 'goTo']
const isValidPropertyForBlock = (node, parent) =>
  !blacklist.includes(node.key.value)
