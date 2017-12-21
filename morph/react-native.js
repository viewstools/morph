import * as BlockBackgroundImage from './react-native/block-background-image.js'
import * as BlockCapture from './react-native/block-capture.js'
import * as BlockWrap from './react-native/block-wrap.js'
import { enter as BlockNameEnter } from './react-native/block-name.js'
import { enter as BlockTestIdEnter } from './react-native/block-test-id.js'
import { leave as PropertiesStyleLeave } from './react-native/properties-style.js'
import getStyleForProperty from './react-native/get-style-for-property.js'
import getStyles from './react-native/get-styles.js'
import getValueForProperty from './react-native/get-value-for-property.js'
import isValidPropertyForBlock from './react-native/is-valid-property-for-block.js'
import makeVisitors from './react/make-visitors.js'
import maybeUsesTextInput from './react-native/maybe-uses-text-input.js'
import maybeUsesRouter from './react-native/maybe-uses-router.js'
import maybeUsesStyleSheet from './react-native/maybe-uses-style-sheet.js'
import morph from './morph.js'
import morphTests, { EMPTY_TEST } from './tests.js'
import restrictedNames from './react-native/restricted-names.js'
import toComponent from './react/to-component.js'

const imports = {
  DismissKeyboard: `import dismissKeyboard from 'dismissKeyboard'`,
  Link: "import { Link } from 'react-router-native'",
  Route: "import { Route } from 'react-router-native'",
  Router: "import { NativeRouter as Router } from 'react-router-native'",
}

export default ({
  file,
  getImport,
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
    defaultProps: false,
    fonts: [],
    images: [],
    isReactNative: true,
    name: finalName,
    remap: {},
    render: [],
    styles: {},
    testIds: {},
    tests: morphTests({ view: tests, file }),
    todos: [],
    uses: [],
    use(block) {
      if (
        state.uses.includes(block) ||
        /props/.test(block) ||
        block === finalName
      )
        return

      state.uses.push(block)
    },
    svgs: [],
    views,
    withRouter: false,
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
    PropertiesStyleLeave,
  })

  visitors.Block = {
    enter(node, parent, state) {
      ;[
        BlockWhen.enter,
        BlockRoute.enter,
        BlockWrap.enter,
        BlockMaybeNeedsProperties.enter,
        BlockName.enter,
        BlockCapture.enter,
        BlockBackgroundImage.enter,
        BlockProxy.enter,
        BlockTestIdEnter,
      ].forEach(fn => fn.call(this, node, parent, state))
    },
    leave(node, parent, state) {
      ;[
        BlockExplicitChildren.leave,
        BlockName.leave,
        BlockWrap.leave,
        BlockRoute.leave,
        BlockWhen.leave,
      ].forEach(fn => fn.call(this, node, parent, state))
    },
  }

  morph(view, state, visitors)

  maybeUsesTextInput(state)
  maybeUsesRouter(state)
  maybeUsesStyleSheet(state)

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
