import * as BlockBackgroundImage from './react-native/block-background-image.js'
import * as BlockCapture from './react-native/block-capture.js'
import * as BlockWrap from './react-native/block-wrap.js'
import { leave as PropertiesStyleLeave } from './react-native/properties-style.js'
import getBlockName from './react-native/get-block-name.js'
import getStyleForProperty from './react-native/get-style-for-property.js'
import getStyles from './react-native/get-styles.js'
import getValueForProperty from './react-native/get-value-for-property.js'
import isValidPropertyForBlock from './react-native/is-valid-property-for-block.js'
import makeVisitors from './react/make-visitors.js'
import maybeUsesTextInput from './react-native/maybe-uses-text-input.js'
import maybeUsesRouter from './react-native/maybe-uses-router.js'
import maybeUsesStyleSheet from './react-native/maybe-uses-style-sheet.js'
import morph from './morph.js'
import toComponent from './react/to-component.js'

const imports = {
  Link: "import { Link } from 'react-router-native'",
  Route: "import { Route } from 'react-router-native'",
  Router: "import { NativeRouter as Router } from 'react-router-native'",
}

export default ({ getImport, name, view }) => {
  const state = {
    captures: [],
    defaultProps: false,
    fonts: [],
    remap: {},
    render: [],
    styles: {},
    todos: [],
    uses: [],
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
    // TODO FlatList
    enter(node, parent, state) {
      ;[
        BlockWhen.enter,
        BlockRoute.enter,
        BlockWrap.enter,
        BlockName.enter,
        BlockCapture.enter,
        BlockBackgroundImage.enter,
        BlockDefaultProps.enter,
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

  return toComponent({ getImport: finalGetImport, getStyles, name, state })
}
