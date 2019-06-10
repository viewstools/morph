import * as visitor from './react-native/block.js'
import getStyleForProperty from './react-native/get-style-for-property.js'
import getStyles from './react-native/get-styles.js'
import getValueForProperty from './react-native/get-value-for-property.js'
import getViewRelativeToView from '../get-view-relative-to-view.js'
import makeGetImport from './react/make-get-import.js'
import maybeUsesTextInput from './react-native/maybe-uses-text-input.js'
import maybeUsesRouter from './react-native/maybe-uses-router.js'
import maybeUsesStyleSheet from './react-native/maybe-uses-style-sheet.js'
import restrictedNames from './react-native/restricted-names.js'
import toComponent from './react/to-component.js'
import walk from './walk.js'

let imports = {
  DismissKeyboard: `import dismissKeyboard from 'dismissKeyboard'`,
  Link: "import { Link } from 'react-router-native'",
  Route: "import { Route } from 'react-router-native'",
  Router: "import { NativeRouter as Router } from 'react-router-native'",
}

export default ({
  getFontImport,
  getSystemImport,
  local,
  localSupported,
  track,
  view,
  viewsById,
  viewsToFiles,
}) => {
  let name = view.id
  let finalName = restrictedNames.includes(name) ? `${name}1` : name
  if (name !== finalName) {
    console.warn(
      `// "${name}" is a Views reserved name.
      We've renamed it to "${finalName}", so your view should work but this isn't ideal.
      To fix this, change its file name to something else.`
    )
  }

  let state = {
    animations: {},
    animated: new Set(),
    images: [],
    dependencies: new Set(),
    flow: null,
    flowSetState: false,
    getFontImport: font => getFontImport(font, view),
    getStyleForProperty,
    getValueForProperty,
    hasRefs: false,
    isReactNative: true,
    isStory: id => {
      let viewInView = getViewRelativeToView({
        id,
        view,
        viewsById,
        viewsToFiles,
      })

      return !viewInView.custom && viewInView.parsed.view.isStory
    },
    lazy: {},
    local,
    locals: {},
    localSupported: [],
    name: finalName,
    remap: {},
    render: [],
    styles: {},
    testIdKey: 'testID',
    testIds: {},
    track,
    usedBlockNames: { [finalName]: 1, AutoSizer: 1, Column: 1, Table: 1 },
    uses: [],
    use(block, isLazy = false) {
      if (isLazy) {
        state.lazy[block] = true
      }

      if (
        state.uses.includes(block) ||
        /props/.test(block) ||
        'React.Fragment' === block ||
        block === finalName
      )
        return

      state.uses.push(block)
    },
    useIsBefore: view.parsed.view.useIsBefore,
    useIsMedia: view.parsed.view.useIsMedia,
  }

  state.fonts = view.parsed.fonts
  state.slots = view.parsed.slots
  state.localSupported = localSupported

  walk(view.parsed.view, visitor, state)

  maybeUsesTextInput(state)
  maybeUsesRouter(state)
  maybeUsesStyleSheet(state)

  return {
    code: toComponent({
      getImport: makeGetImport({
        imports,
        getSystemImport,
        view,
        viewsById,
        viewsToFiles,
      }),
      getStyles,
      name: finalName,
      state,
    }),
    dependencies: state.dependencies,
    flow: state.flow,
    flowDefaultState: state.flowDefaultState,
    // fonts: view.parsed.fonts,
    // slots: view.parsed.slots,
  }
}
