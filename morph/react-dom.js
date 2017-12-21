import * as BlockCapture from './react-dom/block-capture.js'
import * as BlockGoTo from './react-dom/block-go-to.js'
import * as BlockTeleport from './react-dom/block-teleport.js'
import * as PropertiesClassName from './react-dom/properties-class-name.js'
import { enter as BlockNameEnter } from './react-dom/block-name.js'
import { enter as BlockTestIdEnter } from './react-dom/block-test-id.js'
import { leave as PropertiesStyleLeave } from './react-dom/properties-style.js'
import getStyleForProperty from './react-dom/get-style-for-property.js'
import getStyles from './react-dom/get-styles.js'
import getValueForProperty from './react-dom/get-value-for-property.js'
import isValidPropertyForBlock from './react-dom/is-valid-property-for-block.js'
import makeVisitors from './react/make-visitors.js'
import maybeUsesRouter from './react-dom/maybe-uses-router.js'
import morph from './morph.js'
import morphTests, { EMPTY_TEST } from './tests.js'
import restrictedNames from './react-dom/restricted-names.js'
import toComponent from './react/to-component.js'

const imports = {
  Animated: "import Animated from 'react-dom-animated'",
  Link: "import { Link } from 'react-router-dom'",
  Route: "import { Route } from 'react-router-dom'",
  Router: "import { BrowserRouter as Router } from 'react-router-dom'",
}

export default ({
  debug,
  enableAnimated = true,
  file,
  getImport,
  inlineStyles = true,
  name,
  tests = EMPTY_TEST,
  view,
  views = {},
}) => {
  const finalName = restrictedNames.includes(name) ? `${name}1` : name
  if (name !== finalName) {
    console.warn(
      `// "${name}" is a Views reserved name.
      We've renamed it to "${finalName}", so your view should work but this isn't ideal.
      To fix this, change its file name to something else.`
    )
  }

  const state = {
    captures: [],
    cssDynamic: false,
    cssStatic: false,
    enableAnimated,
    defaultProps: false,
    debug,
    file,
    fonts: [],
    images: [],
    inlineStyles,
    isDynamic: false,
    isReactNative: false,
    name: finalName,
    remap: {},
    render: [],
    styles: {},
    svgs: [],
    todos: [],
    usedBlockNames: {},
    uses: [],
    styles: [],
    testIds: {},
    tests: morphTests({ view: tests, file }),
    use(block) {
      if (
        state.uses.includes(block) ||
        /props/.test(block) ||
        block === finalName
      )
        return

      state.uses.push(block)
    },
    views,
    withRouter: false,
  }

  if (name !== finalName) {
    console.warn(
      `// ${name} is a Views reserved name. To fix this, change its file name to something else.`
    )
  }

  const {
    BlockExplicitChildren,
    BlockMaybeNeedsProperties,
    BlockName,
    BlockProxy,
    BlockRoute,
    BlockWhen,
    ...visitors
  } = makeVisitors({
    BlockNameEnter,
    getStyleForProperty,
    getValueForProperty,
    isValidPropertyForBlock,
    PropertiesClassName,
    PropertiesStyleLeave,
  })

  visitors.Block = {
    enter(node, parent, state) {
      ;[
        BlockWhen.enter,
        BlockRoute.enter,
        BlockName.enter,
        BlockCapture.enter,
        BlockTeleport.enter,
        BlockGoTo.enter,
        BlockMaybeNeedsProperties.enter,
        BlockProxy.enter,
        BlockTestIdEnter,
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

  maybeUsesRouter(state)

  const finalGetImport = name => imports[name] || getImport(name)

  return {
    code: toComponent({
      getImport: finalGetImport,
      getStyles,
      name: finalName,
      state,
    }),
    fonts: state.fonts,
    props: state.props,
    svgs: state.svgs,
    tests: state.tests,
    todos: state.todos,
  }
}
